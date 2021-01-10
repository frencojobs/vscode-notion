import { BlockMapType, NotionRenderer } from 'react-notion'
import React from 'react'

declare global {
  interface Window {
    vscode: {
      getState: () => any
      setState: (state: any) => void
      postMessage: (message: any) => void
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const App: React.FC = () => {
  console.log(window.vscode.getState())
  return (
    <NotionRenderer
      fullPage
      hideHeader
      blockMap={window.vscode.getState().data as BlockMapType}
      customBlockComponents={{
        page: ({ blockValue, renderComponent }) => (
          <span
            onClick={() =>
              window.vscode.postMessage({
                command: 'open',
                text: blockValue.id,
              })
            }
          >
            {renderComponent()}
          </span>
        ),
      }}
    />
  )
}

export default App
