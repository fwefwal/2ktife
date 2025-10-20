import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import usersData from "./users.json";

const baseUrl = "http://localhost:3000";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

type UsersState = User[] | null;
type PostsState = Post[] | null;
type FetchErrorState = Error | null;

const UserCard = ({ user, isSelected, onClick }: { user: User; isSelected: boolean; onClick: () => void }) => {
  return (
    <section
      className={`user-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <h3 className="user-name">{user.name}</h3>
      <div className="user-info">
        <p className="user-email">
          <span className="label">Email:</span> 
          <span className="value">{user.email}</span>
        </p>
        <p className="user-phone">
          <span className="label">Phone:</span> 
          <span className="value">{user.phone}</span>
        </p>
        <p className="user-website">
          <span className="label">Website:</span> 
          <span className="value">{user.website}</span>
        </p>
        <p className="user-username">
          <span className="label">Username:</span> 
          <span className="value">@{user.username}</span>
        </p>
      </div>
    </section>
  );
};

const UserCardsGrid = ({ users, selectedUserId, onUserSelect }: { 
  users: User[]; 
  selectedUserId: string | null; 
  onUserSelect: (userId: string) => void 
}) => {
  return (
    <div className="users-grid">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          isSelected={selectedUserId === user.id}
          onClick={() => onUserSelect(user.id)}
        />
      ))}
    </div>
  );
};

function App() {
  const [posts, setPosts] = useState<PostsState>(null);
  const [users, setUsers] = useState<UsersState>(null);
  const [selectedUserId, selectUserId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<FetchErrorState>(null);

  useEffect(() => {
    setLoading(true);

    fetch(baseUrl + "/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error with status: " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.log("Using local users data due to fetch error:", error);
        setUsers(usersData);
        setFetchError(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedUserId === null) {
      return;
    }

    setLoading(true);

    fetch(baseUrl + "/posts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error with status: " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        const userIdNum = parseInt(selectedUserId);
        const userPosts = data.filter((post: Post) => post.userId === userIdNum);
        setPosts(userPosts);
      })
      .catch((error) => {
        setFetchError(error);
        setPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedUserId]);

  return (
    <div className="app">
      <section className="users-section">
        <h2 className="section-title">Пользователи</h2>
        
        {isLoading ? (
          <div className="loading">
            <img src={reactLogo} className="logo spinner" alt="spinner" />
            <p>Загрузка пользователей...</p>
          </div>
        ) : users && users.length > 0 ? (
          <UserCardsGrid 
            users={users} 
            selectedUserId={selectedUserId} 
            onUserSelect={selectUserId} 
          />
        ) : (
          <div className="no-users">
            <p>Нет пользователей для отображения</p>
          </div>
        )}
      </section>

      <main className="posts-section">
        <h2 className="section-title">
          {selectedUserId ? `Посты пользователя #${selectedUserId}` : 'Посты'}
        </h2>

        {selectedUserId === null ? (
          <div className="select-user-prompt">
            <p>Выберите пользователя слева, чтобы увидеть его посты</p>
          </div>
        ) : isLoading ? (
          <div className="loading">
            <img src={reactLogo} className="logo spinner" alt="spinner" />
            <p>Загрузка постов...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="posts-list">
            {posts.slice(0, 5).map((post) => (
              <article key={post.id} className="post-card">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-body">{post.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <p>У этого пользователя нет постов</p>
          </div>
        )}
      </main>

      {fetchError && (
        <div className="error-message">
          <h3>Ошибка загрузки</h3>
          <p>{fetchError.message}</p>
        </div>
      )}
    </div>
  );
}

export default App;