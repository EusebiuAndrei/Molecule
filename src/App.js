import React, { Component, Fragment } from "react";
import "./App.css";

import { mole } from "react-molecule";

// UserPage
const UserPage = mole()(props => {
  const { molecule } = props;

  return (
    <Fragment>
      <SearchBar molecule={molecule} />
      <UserListWithData molecule={molecule} />
    </Fragment>
  );
});

// SearchBar
const SearchBar = ({ molecule }) => {
  return (
    <input onKeyUp={e => molecule.emit("search", { value: e.target.value })} />
  );
};

// UserListWithData
class UserListWithData extends Component {
  state = {
    users: [],
    loading: true
  };

  constructor(props) {
    super(props);

    const { molecule } = props;

    // Here we listen on 'search' event dispatched by the SearchBar
    // This event can only be listened by components within the molecule.
    molecule.on("search", ({ value }) => {
      this.loadData(value);
    });

    this.loadData();
  }

  loadData(search = "") {
    this.setState({ loading: true });

    fetch(`https://jsonplaceholder.typicode.com/users?q=${search}`)
      .then(response => response.json())
      .then(users => this.setState({ users, loading: false }));
  }

  render() {
    const { loading, users } = this.state;

    if (loading) return "Please wait...";

    return <UserList users={users} />;
  }
}

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
