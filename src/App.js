import React, { Component, Fragment } from "react";
import "./App.css";

import { mole, Agent } from "react-molecule";

import { observable } from "mobx";
import { observer } from "mobx-react";

class UsersLoader extends Agent {
  store = observable({
    isLoading: true,
    data: []
  });

  init() {
    this.molecule.on("userSearch", value => {
      this.loadUsers(value);
    });
    console.log("init");
    this.loadUsers();
  }

  loadUsers = (search = "") => {
    Object.assign(this.store, {
      isLoading: true
    });

    fetch(`https://jsonplaceholder.typicode.com/users?q=${search}`)
      .then(response => response.json())
      .then(users => {
        Object.assign(this.store, {
          isLoading: false,
          data: users
        });
      });
  };
}
// UserPage

// Equivallent with <Molecule store={observable.map()}>...</Molecule>
const UserPage = mole(() => {
  return {
    agents: {
      users: UsersLoader.factory()
    }
  };
})(props => {
  // Now we have access to molecule.store.get('xxx');
  const { molecule } = props;

  return (
    <Fragment>
      <SearchBar molecule={molecule} />
      <UserListWithObserve molecule={molecule} />
    </Fragment>
  );
});

// SearchBar
const SearchBar = ({ molecule }) => {
  return <input onKeyUp={e => molecule.emit("userSearch", e.target.value)} />;
};

// UserListWithData

const UserListWithObserve = observer(({ molecule }) => {
  const usersAgent = molecule.agents.users;
  const { isLoading: usersLoading, data: users } = usersAgent.store;

  if (usersLoading) {
    return <p>Loading users ...</p>;
  }

  return <UserList users={users} />;
});

const UserList = ({ users }) => (
  <ul>
    {users.map(user => (
      <li>
        {user.name} - {user.email}
      </li>
    ))}
  </ul>
);

class App extends Component {
  render() {
    return (
      <div className="App">
        <UserPage />
      </div>
    );
  }
}

export default App;
