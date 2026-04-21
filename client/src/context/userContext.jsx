import { createContext, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { userServices } from "../services/user.services";

export const UserContext = createContext();

export const UserContextProvider = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await userServices.getUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, setUsers }}>
      <Outlet />
    </UserContext.Provider>
  );
};
