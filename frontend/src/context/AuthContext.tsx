// import { createContext, useState, useContext } from 'react';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [roles, setRoles] = useState([]);


//   const guardarRolesEnElEstado = (listaRoles) => {
//     setRoles(listaRoles);
//   };

//   return (
//     <AuthContext.Provider value={{ roles, guardarRolesEnElEstado }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// export const useAuth = () => useContext(AuthContext);
