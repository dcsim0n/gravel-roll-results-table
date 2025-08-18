# React Table UI with Ant Design

A simple React.js application built with Vite that demonstrates a professional table interface using the Ant Design UI library.

## Features

- **Modern React**: Built with React 19.1.1 and functional components
- **Ant Design Table**: Professional table component with pagination and styling
- **Fast Development**: Vite for instant hot module replacement (HMR)
- **Sample Data**: Pre-loaded with user data to showcase table functionality
- **Responsive Design**: Clean and professional layout

## Technologies Used

- **React**: Frontend framework
- **Vite**: Build tool and development server
- **Ant Design (antd)**: UI component library
- **ESLint**: Code linting and quality

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
  ├── App.jsx          # Main application component with Ant Design table
  ├── App.css          # Application styles
  ├── main.jsx         # Application entry point
  └── index.css        # Global styles
```

## Table Features

The application displays a table with the following features:
- **Columns**: Name, Age, Address, Email
- **Pagination**: 5 rows per page
- **Borders**: Clean bordered design
- **Sample Data**: 4 user records for demonstration

## Customization

You can easily customize the table by:
- Modifying the `columns` array to change table structure
- Updating the `data` array to display different information
- Adjusting pagination settings and table styling
- Adding more Ant Design components for additional functionality

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
