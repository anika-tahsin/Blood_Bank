Backend:

pip install pipenv
pipenv shell

pipenv install django djangorestframework djangorestframework-simplejwt django-cors-headers
OR
pip install django djangorestframework djangorestframework-simplejwt
pip install django-cors-headers

django-admin startproject backend
cd backend
python manage.py startapp accounts


Frontend:
get out of pipenv shell
npm create vite@latest frontend
cd frontend

npm install
npm install framer-motion @radix-ui/react-icons
//npm install -D tailwindcss postcss autoprefixer
npm install tailwindcss @tailwindcss/postcss autoprefixer

index.css:
@import "tailwindcss";

npm install @vitejs/plugin-react --save-dev
npm install react react-dom
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer

if issue occurs
cd ..
rm -rf frontend
cd frontend
rm -rf node_modules package-lock.json

npm init vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react
npm install -D @tailwindcss/vite

npm run dev

npm cache clean --force

full script for clean up and restart:

# 1. Clean up old files
rm -rf node_modules package-lock.json vite.config.js

# 2. Re-initialize Vite React project in current folder
npm init vite@latest . -- --template react

# 3. Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react

# 4. Overwrite vite.config.js with proper config
echo "import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})" > vite.config.js

# 5. Overwrite src/index.css with Tailwind v4 imports
echo "@import \"tailwindcss\";

@tailwind base;
@tailwind components;
@tailwind utilities;" > src/index.css

# 6. Quick test App.jsx
echo "export default function App() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
      <h1 className='text-4xl font-bold'>Blood Bank</h1>
      <p className='text-lg mt-2'>Tailwind is working 🎉</p>
    </div>
  )
}" > src/App.jsx

# 7. Start dev server
npm run dev

mkdir components pages hooks layouts services utils


npm install react-router-dom
npm install lucide-react


USER ACCOUNT:

cd backend
npm install express mongoose bcrypt jsonwebtoken nodemailer cors dotenv
