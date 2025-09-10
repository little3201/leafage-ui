import { RouterProvider } from "react-router/dom"
import { StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import { router } from './router'


function App() {
  return (
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <RouterProvider router={router} />
    </StyledEngineProvider>
  )
}


export default App