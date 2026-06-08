import { createContext, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { authModules } from "../modules/authModules";

export const UserContext = createContext();

export const UserContextProvider = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await authModules.getUsers();
      setUsers(res.data.users);
    };
    loadUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, setUsers }}>
      <Outlet />
    </UserContext.Provider>
  );
};
