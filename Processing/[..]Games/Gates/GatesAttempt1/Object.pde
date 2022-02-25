
class Object {
  // #region - Setup

  Connection connection;
  int type;
  Gate gate;


  Object(Connection connection_) {
    connection = connection_;
    type = 0;
  }


  Object(Gate gate_) {
    gate = gate_;
    type = 1;
  }

  // #endregion


  // #region - Main

  void select() {
    // Select the object
    selected = this;
    if (type == 0) {
      connection.selected = true;
    } else if (type == 1) {
      gates.remove(gate);
      gates.add(gate);
      gate.selected = true;
    }
  }


  void deselect() {
    // Deselect the object
    if (type == 0) {

      // If the connection is endless then delete
      if (connection.out == null)
        removeConnection(connection);
      else connection.selected = false;
    } else if (type == 1)
      gate.selected = false;
    selected = null;
  }


  void delete() {
    // Remove the object
    if (type == 0) {
      removeConnection(connection);

    // If the object is a gate then remove all the connections
    } else if (type == 1) {
      for (int i = gate.connections.size() - 1; i >= 0; i--)
        removeConnection(gate.connections.get(i));
      gates.remove(gate);
    }
  }

  // #endregion
}
