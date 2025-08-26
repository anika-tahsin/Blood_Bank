# Backend: Django

pip install pipenv
pipenv shell

pip install django djangorestframework djangorestframework-simplejwt
pip install django-cors-headers

django-admin startproject backend
cd backend
python manage.py startapp accounts

# Frontend: React

get out of pipenv shell 
npm create vite@latest frontend cd frontend

npm install
npm install framer-motion @radix-ui/react-icons
npm install tailwindcss 

npm install @vitejs/plugin-react --save-dev
npm install react react-dom

if issue occurs
cd ..
rm -rf frontend
cd frontend
rm -rf node_modules package-lock.json

npm init vite@latest . -- --template react
npm install
npm install -D @tailwindcss/vite

npm run dev

npm run dev

npm install react-router-dom
npm install lucide-react

npm cache clean --force

full script for clean up and restart:

### Re-initialize Vite React project in current folder

npm init vite@latest . -- --template react

### Install dependencies

npm install
npm install -D tailwindcss 

### Overwrite vite.config.js with proper config

echo "import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})" > vite.config.js

# 

# Quick test App.jsx

echo "export default function App() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
      <h1 className='text-4xl font-bold'>Blood Bank</h1>
      <p className='text-lg mt-2'>Tailwind is working 🎉</p>
    </div>
  )
}" > src/App.jsx

# 

# Command Line:

****To make directories: ****

```
mkdir components pages hooks layouts services utils
```

****Clean up old files: ****

```
rm -rf node_modules package-lock.json vite.config.js
```

# Python Shell

user = User.objects.get(email="[anika.ict.aibl@gmail.com](mailto:anika.ict.aibl@gmail.com)")
user.check_password("123456")
