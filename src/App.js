import React, { Component, Fragment } from "react";
import "./App.css";

import { mole, Agent } from "react-molecule";

import { observable } from "mobx";
import { observer } from "mobx-react";

class RESTAgent extends Agent {
  store = observable({
    loading: true,
    data: []
  });

  init() {
    this.on("search,", value => {
      this.load(value);
    });

    this.load();
  }

  load() {
    console.log(this.config.endpoint);
    this.store.loading = true;

    fetch(this.config.endpoint) // Notice the config. Will explain later.
      .then(response => response.json)
      .then(data => {
        if (this.config.single) {
          data = data[0];
        }

        Object.assign(this.store, {
          loading: false,
          data
        });
      });
  }
}

// Our molecule can receive props such as <UserPageMolecule userId={123} />
// const UserPageMolecule = mole(({userId}) => {
//   return {
//   agents: {
//     users: RESTAgent.factory({ endpoint: `https://feed.me/users/${userId}`, single: true }),
//     posts: RESTAgent.factory({ endpoint: 'https://feed.me/posts' })
//   }
// }
// })(UserPage);

const UserPage = mole(({ userId }) => {
  return {
    agents: {
      users: RESTAgent.factory({
        endpoint: `https://feed.me/users/${userId}`,
        //single: true,
        searchEvent: "userSearch"
      }),
      posts: RESTAgent.factory({
        endpoint: "https://feed.me/users",
        searchEvent: "postSearch"
      })
    }
  };
})(props => {
  const { molecule } = props;

  return (
    <Fragment>
      <SearchBar molecule={molecule} />
      <UserListWithObserve molecule={molecule} />
    </Fragment>
  );
});

const SearchBar = ({ molecule }) => {
  const agent = molecule.agents.users;
  return <input onKeyUp={e => agent.emit("search", e.target.value)} />;
};

const UserListWithObserve = observer(({ molecule }) => {
  const usersAgent = molecule.agents.users;
  const { loading: usersLoading, data: users } = usersAgent.store;

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
