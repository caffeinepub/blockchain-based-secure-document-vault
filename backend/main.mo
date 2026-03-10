import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

actor {
  include MixinStorage();

  type Document = {
    id : Text;
    name : Text;
    owner : Principal;
    size : Nat;
    content : Storage.ExternalBlob;
  };

  module Document {
    public func compare(d1 : Document, d2 : Document) : Order.Order {
      Text.compare(d1.name, d2.name);
    };
  };

  let documents = Set.empty<Document>();

  public shared ({ caller }) func addDocument(content : Storage.ExternalBlob, id : Text, name : Text, size : Nat) : async Document {
    let document : Document = {
      id;
      name;
      content;
      owner = caller;
      size;
    };
    documents.add(document);
    document;
  };

  public query ({ caller }) func getDocument(id : Text) : async Document {
    switch (documents.values().find(func(document) { document.id == id })) {
      case (null) { Runtime.trap("Document " # id # " does not exist.") };
      case (?document) {
        if (document.owner != caller) {
          Runtime.trap("You do not have access to this document.");
        };
        document;
      };
    };
  };

  public query ({ caller }) func getMyDocumentIds(includesDoNotStore : Bool) : async [Document] {
    documents.values().filter(func(document) { document.owner == caller }).toArray().sort();
  };

  public shared ({ caller }) func deleteDocument(id : Text) : async () {
    let document = switch (documents.values().find(func(document) { document.id == id })) {
      case (null) { Runtime.trap("Document " # id # " does not exist.") };
      case (?document) { document };
    };
    if (document.owner != caller) {
      Runtime.trap("You do not have access to this document.");
    };
    documents.remove(document);
  };
};
