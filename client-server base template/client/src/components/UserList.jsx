import React, { useState } from "react";
import { getUsers } from "../services/api";

function UserList() {
  const [users, setUsers] = useState([]);

  const handleLoadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div>
      <button onClick={handleLoadUsers}>Load Users</button>

      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
