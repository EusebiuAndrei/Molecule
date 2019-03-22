import React, { Component, Fragment } from "react";
import "./App.css";

import { mole } from "react-molecule";

import { observable } from "mobx";
import { observer } from "mobx-react";

// UserPage

// Equivallent with <Molecule store={observable.map()}>...</Molecule>
const UserPage = mole(() => {
  return {
    store: observable.map()
  };
})(props => {
  // Now we have access to molecule.store.get('xxx');
  const { molecule } = props;

  return (
    <Fragment>
      <SearchBar molecule={molecule} />
      <UserListObserver molecule={molecule} />
    </Fragment>
  );
});

// SearchBar
const SearchBar = ({ molecule }) => {
  return (
    <input onKeyUp={e => molecule.store.set("currentSearch", e.target.value)} />
  );
};

// UserListWithData

const UserListObserver = observer(({ molecule }) => {
  return (
    <UserListWithData currentSearch={molecule.store.get("currentSearch")} />
  );
});
// Now UserListWithData receives `currentSearch` as prop, no longer listens to any event
// So in order to implement that kind of search you would do the load inside

class UserListWithData extends Component {
  state = {
    users: [],
    loading: true
  };

  componentDidMount = () => {
    this.loadData();
  };

  componentDidUpdate = () => {
    this.loadData(this.props.currentSearch);
  };

  loadData(search = "") {
    fetch(`https://jsonplaceholder.typicode.com/users?q=${search}`)
      .then(response => response.json())
      .then(users => this.setState({ users }));
  }

  render() {
    const { users } = this.state;

    //if (loading) return "Please wait...";

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
