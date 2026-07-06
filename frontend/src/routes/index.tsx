import type { RouteObject } from 'react-router-dom'

import Home from '../pages/Home'

const routes: RouteObject[] = [
    { path: '/', element: <Home /> },
    { path: '*', element: <div className="p-8">404 — Not Found</div> },
]

export default routes
