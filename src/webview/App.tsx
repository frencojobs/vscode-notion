import React, { useEffect } from 'react'
import { BlockMapType, NotionRenderer } from 'react-notion'

declare global {
  interface Window {
    data: Record<string, unknown>
    vscode: {
      getState: () => any
      setState: (state: any) => void
      postMessage: (message: any) => void
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const App: React.FC = () => {
  useEffect(() => {
    // saves the state to use when deserializing
    if (!window.vscode.getState()) {
      window.vscode.setState(window.data)
    }
  }, [])

  return (
    <NotionRenderer
      fullPage
      hideHeader
      blockMap={window.data as BlockMapType}
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
