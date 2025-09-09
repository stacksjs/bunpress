---
title: Syntax Highlighting Example
description: Comprehensive syntax highlighting examples for various programming languages in BunPress
author: BunPress Team
layout: doc
toc: sidebar
sidebar:
  - text: Overview
    link: /syntax-highlighting-example#overview
  - text: JavaScript/TypeScript
    link: /syntax-highlighting-example#javascripttypescript
  - text: Python
    link: /syntax-highlighting-example#python
  - text: Rust
    link: /syntax-highlighting-example#rust
  - text: Go
    link: /syntax-highlighting-example#go
  - text: Custom Languages
    link: /syntax-highlighting-example#custom-languages
  - text: Line Highlighting
    link: /syntax-highlighting-example#line-highlighting
  - text: Copy to Clipboard
    link: /syntax-highlighting-example#copy-to-clipboard
---

# Syntax Highlighting Example

This example demonstrates comprehensive syntax highlighting capabilities in BunPress using Shiki and various programming languages.

## Overview

BunPress provides powerful syntax highlighting through:

- **Shiki Integration** - High-quality syntax highlighting
- **Multiple Languages** - Support for 100+ programming languages
- **Themes** - Light and dark theme support
- **Line Highlighting** - Highlight specific lines
- **Copy to Clipboard** - One-click code copying
- **Custom Languages** - Support for custom language definitions

## JavaScript/TypeScript

### Basic JavaScript

```javascript
// Function declaration
function greetUser(name) {
  console.log(`Hello, ${name}!`)
  return true
}

// Arrow function with async/await
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`)
    const userData = await response.json()

    if (userData.active) {
      return {
        ...userData,
        lastLogin: new Date(userData.lastLogin)
      }
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    throw new Error('User data fetch failed')
  }
}

// Class definition
class UserManager {
  constructor(apiUrl) {
    this.apiUrl = apiUrl
    this.users = new Map()
  }

  async addUser(userData) {
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
      active: true
    }

    this.users.set(user.id, user)
    return user
  }

  getUser(id) {
    return this.users.get(id) || null
  }
}
```

### TypeScript with Advanced Features

```typescript
// Generic interfaces
interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
  timestamp: Date
}

// Union types and discriminated unions
type UserRole = 'admin' | 'moderator' | 'user'
type Permission = 'read' | 'write' | 'delete' | 'admin'

interface User {
  id: number
  name: string
  email: string
  role: UserRole
  permissions: Permission[]
}

// Generic function with constraints
function createApiResponse<T extends { id: number }>(
  data: T,
  status: 'success' | 'error' = 'success'
): ApiResponse<T> {
  return {
    data,
    status,
    timestamp: new Date()
  }
}

// Async generator function
async function* userIterator(users: User[]): AsyncIterableIterator<User> {
  for (const user of users) {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    yield user
  }
}

// Utility types
type ReadonlyUser = Readonly<User>
type PartialUser = Partial<User>
type UserKeys = keyof User

// Mapped types
type UserPermissions = {
  [K in UserRole]: Permission[]
}

// Conditional types
type IsAdmin<T extends UserRole> = T extends 'admin' ? true : false
```

## Python

### Data Science and Machine Learning

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import matplotlib.pyplot as plt

# Load and preprocess data
def load_and_preprocess_data(filepath):
    """Load CSV data and perform basic preprocessing."""
    df = pd.read_csv(filepath)

    # Handle missing values
    df.dropna(inplace=True)

    # Convert categorical variables
    categorical_cols = df.select_dtypes(include=['object']).columns
    df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

    return df

# Machine learning pipeline
def train_model(X, y):
    """Train a random forest classifier."""
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Initialize and train model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    # Make predictions
    y_pred = model.predict(X_test)

    # Evaluate model
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)

    return model, accuracy, report

# Data visualization
def create_visualization(df, feature_importance):
    """Create comprehensive data visualization."""
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))

    # Feature importance plot
    axes[0, 0].barh(range(len(feature_importance)), feature_importance.values)
    axes[0, 0].set_yticks(range(len(feature_importance)))
    axes[0, 0].set_yticklabels(feature_importance.index)
    axes[0, 0].set_title('Feature Importance')

    # Correlation heatmap
    correlation_matrix = df.corr()
    im = axes[0, 1].imshow(correlation_matrix, cmap='coolwarm')
    axes[0, 1].set_title('Correlation Matrix')
    plt.colorbar(im, ax=axes[0, 1])

    # Distribution plots
    numerical_cols = df.select_dtypes(include=[np.number]).columns[:4]
    for i, col in enumerate(numerical_cols[:4]):
        row = 1
        col_idx = i
        if col_idx >= 2:
            row = 1
            col_idx -= 2

        axes[row, col_idx].hist(df[col], bins=30, alpha=0.7)
        axes[row, col_idx].set_title(f'Distribution of {col}')
        axes[row, col_idx].set_xlabel(col)
        axes[row, col_idx].set_ylabel('Frequency')

    plt.tight_layout()
    return fig

# Main execution
if __name__ == "__main__":
    # Load data
    data = load_and_preprocess_data('data/dataset.csv')

    # Prepare features and target
    X = data.drop('target', axis=1)
    y = data['target']

    # Train model
    model, accuracy, report = train_model(X, y)

    print(f"Model Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(report)

    # Create visualizations
    feature_importance = pd.Series(
        model.feature_importances_,
        index=X.columns
    ).sort_values(ascending=False)

    fig = create_visualization(data, feature_importance)
    plt.savefig('model_analysis.png', dpi=300, bbox_inches='tight')
    plt.show()
```

### Web Development with FastAPI

```python
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import uvicorn
import jwt
import bcrypt
from datetime import datetime, timedelta
import databases
import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database setup
DATABASE_URL = "postgresql://user:password@localhost/db"
database = databases.Database(DATABASE_URL)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Security
security = HTTPBearer()
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# FastAPI app
app = FastAPI(
    title="User Management API",
    description="A comprehensive user management system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/register", response_model=User)
async def register_user(user: UserCreate, db: SessionLocal = Depends(get_db)):
    """Register a new user."""
    # Check if user exists
    db_user = db.query(UserDB).filter(
        (UserDB.username == user.username) | (UserDB.email == user.email)
    ).first()

    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserDB(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return User.from_orm(db_user)

@app.post("/login", response_model=Token)
async def login(credentials: dict, db: SessionLocal = Depends(get_db)):
    """Authenticate user and return access token."""
    user = db.query(UserDB).filter(UserDB.username == credentials.get("username")).first()

    if not user or not verify_password(credentials.get("password"), user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(get_db)
):
    """Get current authenticated user."""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        user = db.query(UserDB).filter(UserDB.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return User.from_orm(user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/users", response_model=List[User])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    """Get list of users with pagination."""
    users = db.query(UserDB).offset(skip).limit(limit).all()
    return [User.from_orm(user) for user in users]

@app.put("/users/{user_id}", response_model=User)
async def update_user(
    user_id: int,
    user_update: UserBase,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    """Update user information."""
    user = db.query(UserDB).filter(UserDB.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Check permissions (only user can update themselves or admin can update anyone)
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return User.from_orm(user)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

## Rust

### Systems Programming

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tokio::sync::mpsc;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};

// Data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: u64,
    username: String,
    email: String,
    active: bool,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Order {
    id: u64,
    user_id: u64,
    amount: f64,
    currency: String,
    status: OrderStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
enum OrderStatus {
    Pending,
    Processing,
    Completed,
    Failed,
}

// Thread-safe storage
#[derive(Clone)]
struct AppState {
    users: Arc<Mutex<HashMap<u64, User>>>,
    orders: Arc<Mutex<HashMap<u64, Order>>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            users: Arc::new(Mutex::new(HashMap::new())),
            orders: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn add_user(&self, user: User) -> Result<()> {
        let mut users = self.users.lock().map_err(|_| anyhow::anyhow!("Lock poisoned"))?;
        users.insert(user.id, user);
        Ok(())
    }

    fn get_user(&self, id: u64) -> Result<Option<User>> {
        let users = self.users.lock().map_err(|_| anyhow::anyhow!("Lock poisoned"))?;
        Ok(users.get(&id).cloned())
    }

    fn add_order(&self, order: Order) -> Result<()> {
        let mut orders = self.orders.lock().map_err(|_| anyhow::anyhow!("Lock poisoned"))?;
        orders.insert(order.id, order);
        Ok(())
    }
}

// Async processing
async fn process_orders(state: AppState, mut receiver: mpsc::Receiver<Order>) {
    while let Some(order) = receiver.recv().await {
        println!("Processing order {} for user {}", order.id, order.user_id);

        // Simulate processing time
        tokio::time::sleep(Duration::from_millis(100)).await;

        // Update order status
        let mut orders = state.orders.lock().unwrap();
        if let Some(mut existing_order) = orders.get_mut(&order.id) {
            existing_order.status = OrderStatus::Processing;
        }

        // More processing...
        tokio::time::sleep(Duration::from_millis(200)).await;

        // Complete order
        if let Some(mut existing_order) = orders.get_mut(&order.id) {
            existing_order.status = OrderStatus::Completed;
        }

        println!("Order {} completed", order.id);
    }
}

// Error handling with custom types
#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Authentication error")]
    Auth,
}

// Database operations
async fn save_user_to_db(db: &sqlx::PgPool, user: &User) -> Result<(), AppError> {
    sqlx::query(
        "INSERT INTO users (id, username, email, active, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username,
           email = EXCLUDED.email,
           active = EXCLUDED.active"
    )
    .bind(user.id as i64)
    .bind(&user.username)
    .bind(&user.email)
    .bind(user.active)
    .bind(user.created_at)
    .execute(db)
    .await?;

    Ok(())
}

// Generic utilities
fn validate_input<T: std::fmt::Display>(input: &T, min_len: usize) -> Result<(), AppError> {
    let input_str = input.to_string();
    if input_str.len() < min_len {
        return Err(AppError::Validation(
            format!("Input too short: {} < {}", input_str.len(), min_len)
        ));
    }
    Ok(())
}

// Main application
#[tokio::main]
async fn main() -> Result<()> {
    // Initialize state
    let state = AppState::new();

    // Create some test users
    let users = vec![
        User {
            id: 1,
            username: "alice".to_string(),
            email: "alice@example.com".to_string(),
            active: true,
            created_at: chrono::Utc::now(),
        },
        User {
            id: 2,
            username: "bob".to_string(),
            email: "bob@example.com".to_string(),
            active: true,
            created_at: chrono::Utc::now(),
        },
    ];

    // Add users to state
    for user in users {
        state.add_user(user.clone())?;
        println!("Added user: {} ({})", user.username, user.email);
    }

    // Create orders channel
    let (tx, rx) = mpsc::channel(100);

    // Spawn order processor
    let processor_state = state.clone();
    tokio::spawn(async move {
        process_orders(processor_state, rx).await;
    });

    // Create and send orders
    for i in 1..=5 {
        let order = Order {
            id: i,
            user_id: (i % 2) + 1, // Alternate between user 1 and 2
            amount: (i as f64) * 10.0,
            currency: "USD".to_string(),
            status: OrderStatus::Pending,
        };

        state.add_order(order.clone())?;
        tx.send(order).await.context("Failed to send order")?;
    }

    // Wait for processing to complete
    tokio::time::sleep(Duration::from_secs(2)).await;

    // Display final state
    println!("\nFinal state:");
    let users = state.users.lock().unwrap();
    let orders = state.orders.lock().unwrap();

    for (user_id, user) in users.iter() {
        println!("User {}: {}", user_id, user.username);
        let user_orders: Vec<_> = orders.values()
            .filter(|order| order.user_id == *user_id)
            .collect();

        for order in user_orders {
            println!("  Order {}: ${:.2} ({:?})",
                    order.id, order.amount, order.status);
        }
    }

    Ok(())
}
```

## Go

### Microservices Architecture

```go
package main

import (
    "context"
    "database/sql"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "strconv"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/go-playground/validator/v10"
    "github.com/golang-jwt/jwt/v4"
    "github.com/google/uuid"
    "github.com/lib/pq"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    "github.com/redis/go-redis/v9"
    "github.com/robfig/cron/v3"
    "go.uber.org/zap"
    "golang.org/x/crypto/bcrypt"
)

// Configuration
type Config struct {
    DatabaseURL string `json:"database_url"`
    RedisURL    string `json:"redis_url"`
    JWTSecret   string `json:"jwt_secret"`
    ServerPort  string `json:"server_port"`
    LogLevel    string `json:"log_level"`
}

// Models
type User struct {
    ID        uuid.UUID `json:"id" db:"id"`
    Username  string    `json:"username" db:"username" validate:"required,min=3,max=50"`
    Email     string    `json:"email" db:"email" validate:"required,email"`
    Password  string    `json:"-" db:"password_hash"`
    Active    bool      `json:"active" db:"active"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CreateUserRequest struct {
    Username string `json:"username" binding:"required,min=3,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type Claims struct {
    UserID   uuid.UUID `json:"user_id"`
    Username string    `json:"username"`
    jwt.RegisteredClaims
}

// Services
type UserService struct {
    db     *sql.DB
    redis  *redis.Client
    logger *zap.Logger
}

func NewUserService(db *sql.DB, redis *redis.Client, logger *zap.Logger) *UserService {
    return &UserService{
        db:     db,
        redis:  redis,
        logger: logger,
    }
}

func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*User, error) {
    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        s.logger.Error("Failed to hash password", zap.Error(err))
        return nil, fmt.Errorf("failed to hash password: %w", err)
    }

    user := &User{
        ID:        uuid.New(),
        Username:  req.Username,
        Email:     req.Email,
        Password:  string(hashedPassword),
        Active:    true,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    // Insert user
    query := `
        INSERT INTO users (id, username, email, password_hash, active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at, updated_at`

    err = s.db.QueryRowContext(ctx, query,
        user.ID, user.Username, user.Email, user.Password,
        user.Active, user.CreatedAt, user.UpdatedAt,
    ).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

    if err != nil {
        s.logger.Error("Failed to create user", zap.Error(err))
        return nil, fmt.Errorf("failed to create user: %w", err)
    }

    s.logger.Info("User created successfully",
        zap.String("user_id", user.ID.String()),
        zap.String("username", user.Username))

    return user, nil
}

func (s *UserService) AuthenticateUser(ctx context.Context, username, password string) (*User, error) {
    user := &User{}

    query := `SELECT id, username, email, password_hash, active, created_at, updated_at
              FROM users WHERE username = $1`

    err := s.db.QueryRowContext(ctx, query, username).Scan(
        &user.ID, &user.Username, &user.Email, &user.Password,
        &user.Active, &user.CreatedAt, &user.UpdatedAt,
    )

    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("user not found")
        }
        s.logger.Error("Database query failed", zap.Error(err))
        return nil, fmt.Errorf("database error: %w", err)
    }

    // Check password
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        return nil, fmt.Errorf("invalid password")
    }

    return user, nil
}

// Middleware
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        if tokenString == authHeader {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
            c.Abort()
            return
        }

        claims := &Claims{}
        token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
            return []byte(jwtSecret), nil
        })

        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Set("user_id", claims.UserID)
        c.Set("username", claims.Username)
        c.Next()
    }
}

// Metrics
var (
    requestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )

    requestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
        },
        []string{"method", "endpoint"},
    )
)

func init() {
    prometheus.MustRegister(requestsTotal)
    prometheus.MustRegister(requestDuration)
}

// Handlers
func createUserHandler(userService *UserService, jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req CreateUserRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        user, err := userService.CreateUser(c.Request.Context(), req)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
            return
        }

        // Generate JWT token
        claims := Claims{
            UserID:   user.ID,
            Username: user.Username,
            RegisteredClaims: jwt.RegisteredClaims{
                ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
                IssuedAt:  jwt.NewNumericDate(time.Now()),
            },
        }

        token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
        tokenString, err := token.SignedString([]byte(jwtSecret))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
            return
        }

        c.JSON(http.StatusCreated, gin.H{
            "user":    user,
            "token":   tokenString,
            "message": "User created successfully",
        })
    }
}

func loginHandler(userService *UserService, jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req LoginRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        user, err := userService.AuthenticateUser(c.Request.Context(), req.Username, req.Password)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }

        claims := Claims{
            UserID:   user.ID,
            Username: user.Username,
            RegisteredClaims: jwt.RegisteredClaims{
                ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
                IssuedAt:  jwt.NewNumericDate(time.Now()),
            },
        }

        token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
        tokenString, err := token.SignedString([]byte(jwtSecret))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "token":   tokenString,
            "message": "Login successful",
        })
    }
}

// Background jobs
func startBackgroundJobs(userService *UserService, logger *zap.Logger) {
    c := cron.New()

    // Clean up inactive users daily
    c.AddFunc("@daily", func() {
        logger.Info("Running daily cleanup job")

        // Implementation for cleanup job
        // This would typically involve database operations
    })

    c.Start()
}

// Main function
func main() {
    // Load configuration
    config := Config{
        DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@localhost/db?sslmode=disable"),
        RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
        JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
        ServerPort:  getEnv("SERVER_PORT", "8080"),
        LogLevel:    getEnv("LOG_LEVEL", "info"),
    }

    // Initialize logger
    logger, _ := zap.NewProduction()
    defer logger.Sync()

    // Initialize database
    db, err := sql.Open("postgres", config.DatabaseURL)
    if err != nil {
        logger.Fatal("Failed to connect to database", zap.Error(err))
    }
    defer db.Close()

    // Test database connection
    if err := db.Ping(); err != nil {
        logger.Fatal("Failed to ping database", zap.Error(err))
    }

    // Initialize Redis
    redisClient := redis.NewClient(&redis.Options{
        Addr: config.RedisURL,
    })
    defer redisClient.Close()

    // Test Redis connection
    if err := redisClient.Ping(context.Background()).Err(); err != nil {
        logger.Fatal("Failed to connect to Redis", zap.Error(err))
    }

    // Initialize services
    userService := NewUserService(db, redisClient, logger)

    // Start background jobs
    startBackgroundJobs(userService, logger)

    // Initialize Gin router
    r := gin.New()

    // Middleware
    r.Use(gin.Logger())
    r.Use(gin.Recovery())
    r.Use(AuthMiddleware(config.JWTSecret))

    // Routes
    api := r.Group("/api/v1")
    {
        api.POST("/users", createUserHandler(userService, config.JWTSecret))
        api.POST("/login", loginHandler(userService, config.JWTSecret))

        // Protected routes
        protected := api.Group("/")
        protected.Use(AuthMiddleware(config.JWTSecret))
        {
            protected.GET("/users/:id", getUserHandler(userService))
            protected.PUT("/users/:id", updateUserHandler(userService))
            protected.DELETE("/users/:id", deleteUserHandler(userService))
        }
    }

    // Metrics endpoint
    r.GET("/metrics", gin.WrapH(promhttp.Handler()))

    // Health check
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status": "healthy",
            "timestamp": time.Now(),
        })
    })

    // Start server
    addr := fmt.Sprintf(":%s", config.ServerPort)
    logger.Info("Starting server", zap.String("address", addr))

    if err := r.Run(addr); err != nil {
        logger.Fatal("Failed to start server", zap.Error(err))
    }
}

// Utility functions
func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

// Placeholder handlers for protected routes
func getUserHandler(userService *UserService) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.Param("id")
        c.JSON(http.StatusOK, gin.H{"user_id": userID, "message": "Get user endpoint"})
    }
}

func updateUserHandler(userService *UserService) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.Param("id")
        c.JSON(http.StatusOK, gin.H{"user_id": userID, "message": "Update user endpoint"})
    }
}

func deleteUserHandler(userService *UserService) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.Param("id")
        c.JSON(http.StatusOK, gin.H{"user_id": userID, "message": "Delete user endpoint"})
    }
}
```

## Custom Languages

### STX Template Language

```stx
---
title: Custom Template
layout: page
---

# Welcome to {{ title }}

This is a custom STX template with {{ features }}.

## Features

{{#each features}}
- {{ this.name }}: {{ this.description }}
{{/each}}

## Conditional Rendering

{{#if showAdvanced}}
### Advanced Options

{{#each advancedOptions}}
- {{ this }}
{{/each}}
{{/if}}

{{#unless showAdvanced}}
*Basic mode enabled*
{{/unless}}
```

### GraphQL Schema

```graphql
type Query {
  users(limit: Int, offset: Int): [User!]!
  user(id: ID!): User
  posts(userId: ID, tag: String): [Post!]!
  search(query: String!): SearchResult!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!

  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!

  addComment(postId: ID!, input: CreateCommentInput!): Comment!
}

type User {
  id: ID!
  username: String!
  email: String!
  profile: UserProfile
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserProfile {
  firstName: String
  lastName: String
  bio: String
  avatar: String
  website: String
  socialLinks: [String!]
}

type Post {
  id: ID!
  title: String!
  content: String!
  excerpt: String
  author: User!
  tags: [String!]
  comments: [Comment!]!
  published: Boolean!
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  parent: Comment
  replies: [Comment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateUserInput {
  username: String!
  email: String!
  password: String!
  profile: UserProfileInput
}

input UpdateUserInput {
  username: String
  email: String
  profile: UserProfileInput
}

input CreatePostInput {
  title: String!
  content: String!
  tags: [String!]
  published: Boolean
}

input UpdatePostInput {
  title: String
  content: String
  tags: [String!]
  published: Boolean
}

input CreateCommentInput {
  content: String!
  parentId: ID
}

type SearchResult {
  users: [User!]!
  posts: [Post!]!
  totalCount: Int!
}

scalar DateTime

enum SortOrder {
  ASC
  DESC
}
```

## Line Highlighting

### Highlighted Lines

```javascript {1,3-5,8}
// This line is highlighted
function example() {
  // These lines are highlighted
  const data = fetchData()
  processData(data)
  return result
}

// This line is highlighted
console.log('Done')
```

### Focused Lines

```python {2-4}
def process_data(data):
  # Focus on these lines
  cleaned = clean_data(data)
  transformed = transform_data(cleaned)
  validated = validate_data(transformed)
  return validated
```

## Copy to Clipboard

All code blocks in BunPress include a copy-to-clipboard button that:

- **One-click copying** - Copy code with a single click
- **Visual feedback** - Shows "Copied!" confirmation
- **Accessibility** - Keyboard navigation support
- **Error handling** - Graceful fallback for older browsers

```typescript
// Copy functionality with error handling
async function copyToClipboard(text: string): Promise<void> {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      fallbackCopy(text)
    }

    showSuccessFeedback()
  } catch (error) {
    console.error('Copy failed:', error)
    showErrorFeedback()
  }
}
```

This comprehensive syntax highlighting system ensures your code examples are beautifully displayed and easily accessible to your users.
