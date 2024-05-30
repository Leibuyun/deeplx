import { appWindow } from '@tauri-apps/api/window'
import { IconButton } from '@mui/joy'
import IconMinimize from './assets/small.svg?react'
import IconClose from './assets/close.svg?react'
import IconLogo from './assets/logo.svg?react'

export default function Header() {
  return (
    <div data-tauri-drag-region className='custom-header' style={{ marginBottom: 8, userSelect: 'none' }}>
      <div className='padding flex' style={{ gap: 8 }}>
        <IconLogo />
        <span>translator</span>
      </div>
      <div>
        <IconButton onClick={() => appWindow.minimize()}>
          <IconMinimize />
        </IconButton>
        <IconButton onClick={() => appWindow.close()}>
          <IconClose />
        </IconButton>
      </div>
    </div>
  )
}
