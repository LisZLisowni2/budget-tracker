# Budget tracker - Muli-Service App
<a href='https://roadmap.sh/projects/multiservice-docker'>Link to the task</a>

A expanded personal finance management application that helps you track expenses, monitor budgets and visualize data, so it help you manage own finance habits. 

## Features

### Transactions tracking
- Log revenues and expenses
- Categories in your at your disposal
- Easy-to-use dashboard

### Goals
- Set your goals in dashboard
- Monitor progress of goals
- Easy-to-use dashboard 

### Notes
- Write notes about goals, transaction or anything you want
- Format Markdown
- Easy to copy note

### Analytics
- Visual charts and graphs showing spending patterns
- Custome date range filtering
- Category-wise breakdown of expenses

### Security & Privacy
- Secure authentication with password protection
- Usage of JWT tokens for the most impenetrable security is possible

### User Experience
- Intuitive interface
- Own currency setting available

## Installation

### Prerequisites
- Docker
- Docker Swarm

### Config
```sh
# Clone the repository
git clone https://github.com/LisZLisowni2/budget-tracker 

# Init docker swarm
docker swarm init

# Create Secrets for sensitive data
echo "<input your db_password>" | docker secret create db_password -
echo "<input your redis_password>" | docker secret create redis_password -
echo "<input your jwt_token>" | docker secret create jwt_token -

# Create private registry 
docker service create --name registry --publish mode=host,target=5000,published=5000,protocol=tcp registry:2
```

### Build 
```sh
# Build frontend 
docker build -t 127.0.0.1:5000/budget-tracker-frontend:latest -f ./frontend/Dockerfile ./frontend

# Build backend
docker build -t 127.0.0.1:5000/budget-tracker-backend:latest ./backend

# Push images
docker push 127.0.0.1:5000/budget-tracker-frontend-dev:latest
docker push 127.0.0.1:5000/budget-tracker-backend:latest 
```

### Run
```sh
docker stack deploy -c docker-compose.yml BudgetTrackerStack
```

## References
- API Docs: 
    - `127.0.0.1:3000/api-docs` (after running application)
    - Endpoints API document
- Reasons of choosing that technology
- License:

## Acknowledgments
- Chart library by Recharts