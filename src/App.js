import React, { Component, Fragment } from "react";
import "./App.css";

import { mole, Agent } from "react-molecule";

import { observable } from "mobx";
import { observer } from "mobx-react";

class DataLoaderAgent extends Agent {
  store = observable({
    results: []
  });

  init() {
    this.load();
  }

  load() {
    console.log("load");
    const { endpoint } = this.config;
    let payload = { endpoint };

    // Here we emit an event that can be manipulated by it's listeners.
    this.emit("pre_load", payload);

    fetch(payload.endpoint)
      .then(r => r.json())
      .then(results => {
        this.store.results = results;
      });
  }
}

class SearchAgent extends Agent {
  store = observable({
    currentSearch: ""
  });

  prepare() {
    // Note that we can pass the agent's name in SearchAgent's factory
    // If you use consistent name, you can just rely on just 'agent' or 'loader'

    // Keep in mind you're in molecule territory here
    this.loader = this.getAgent(this.config.agent);

    // We hook in here to make absolutely sure that the loader doesn't do initial loading at init()
    this.loader.on("pre_load", payload => {
      // we can manipulate it here every time
      payload.endpoint = payload.endpoint + `?q=${this.store.currentSearch}`;
    });
  }

  init() {
    this.on("search", search => {
      console.log("search", this.store.get("currentSearch"));
      this.store.set("currentSearch", search);
      // You can just trigger a search when an event gets emitted
      this.loader.load();
    });
  }
}

// UserPage

// Equivallent with <Molecule store={observable.map()}>...</Molecule>
const UserPage = mole(() => {
  return {
    agents: {
      search: SearchAgent.factory({ agent: "loader" }),
      loader: DataLoaderAgent.factory({
        endpoint: "https://jsonplaceholder.typicode.com/users"
      })
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
  return (
    <input
      onKeyUp={e => {
        console.log("whaat");
        console.log(molecule.emit("search", e.target.value));
        molecule.emit("search", e.target.value);
      }}
    />
  );
};

// UserListWithData

const UserListWithObserve = observer(({ molecule }) => {
  const usersAgent = molecule.agents.loader;
  const { results: users } = usersAgent.store;

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
