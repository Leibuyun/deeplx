import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api'
import { debounce } from 'lodash-es'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Typography from '@mui/joy/Typography'
import Textarea from '@mui/joy/Textarea'
import { List, ListItem, Snackbar } from '@mui/joy'
import IconButton from '@mui/joy/IconButton'
import Header from './Header'
import IconDelete from './assets/delete.svg?react'
import IconChange from './assets/change.svg?react'
import './App.css'

const languages = [
  { label: '自动检测', val: 'AUTO' },
  { label: '中文', val: 'ZH' },
  { label: '英语', val: 'EN' },
  { label: '日语', val: 'JA' },
  { label: '保加利亚语', val: 'BG' },
  { label: '捷克语', val: 'CS' },
  { label: '丹麦语', val: 'DA' },
  { label: '荷兰语', val: 'NL' },
  { label: '爱沙尼亚语', val: 'ET' },
  { label: '芬兰语', val: 'FI' },
  { label: '法语', val: 'FR' },
  { label: '德语', val: 'DE' },
  { label: '希腊语', val: 'EL' },
  { label: '匈牙利语', val: 'HU' },
  { label: '意大利语', val: 'IT' },
  { label: '拉脱维亚语', val: 'LV' },
  { label: '立陶宛语', val: 'LT' },
  { label: '波兰语', val: 'PL' },
  { label: '葡萄牙语', val: 'PT' },
  { label: '罗马尼亚语', val: 'RO' },
  { label: '俄语', val: 'RU' },
  { label: '斯洛伐克语', val: 'SK' },
  { label: '斯洛文尼亚语', val: 'SL' },
  { label: '西班牙语', val: 'ES' },
  { label: '瑞典语', val: 'SV' },
]

type TranslateResp = {
  alternatives: string[]
  code: number
  id: string
  method: string
  data: string
  source_lang: string
  target_lang: string
}

function App() {
  const [text, setText] = useState('')
  const [targetText, setTargetText] = useState('')
  const [targetLang, setTargetLang] = useState('ZH')
  const [sourceLang, setSourceLang] = useState('AUTO')
  const [error, setError] = useState('')
  const [alternatives, setAlternatives] = useState<string[]>([])

  const [apiSource, setApiSource] = useState('')
  const [apiTarget, setApiTarget] = useState('')

  const [debounceText, setDebounceText] = useState('')

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError('')
      }, 1500)
    }
  }, [error])

  useEffect(() => {
    const debounced = debounce((text: string) => {
      setDebounceText(text)
    }, 500)
    debounced(text)
    return () => {
      debounced.cancel()
    }
  }, [text])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await invoke<TranslateResp>('translate_lang', {
          sourceLang,
          targetLang,
          text: debounceText,
        })
        if (result) {
          setTargetText(result.data)
          setAlternatives(result.alternatives)
          setApiSource(result.source_lang)
          setApiTarget(result.target_lang)
        }
      } catch (e: any) {
        setError(e)
      }
    }
    if (debounceText) {
      fetchData()
    }
  }, [sourceLang, targetLang, debounceText])

  return (
    <div className='app' onContextMenu={(e) => e.preventDefault()}>
      <Header />
      <header className='container padding'>
        <Autocomplete
          disablePortal
          options={languages}
          sx={{ width: 300 }}
          value={languages.find((lang) => lang.val === sourceLang)}
          onChange={(_, value) => {
            value && setSourceLang(value.val)
          }}
          renderInput={(params) => <TextField {...params} label='源语言' />}
        />
        {apiSource && apiTarget && apiSource !== 'AUTO' && (
          <IconButton
            onClick={() => {
              if (apiSource && apiTarget) {
                const temp = sourceLang
                setSourceLang(targetLang)
                setTargetLang(temp)
              }
            }}
          >
            <IconChange />
          </IconButton>
        )}
        <Autocomplete
          disablePortal
          options={languages.slice(1)}
          sx={{ width: 300 }}
          value={languages.find((lang) => lang.val === targetLang)}
          onChange={(_, value) => {
            value && setTargetLang(value.val)
          }}
          renderInput={(params) => <TextField {...params} label='目标语言' />}
        />
      </header>
      <main className='main padding'>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          minRows={20}
          maxRows={20}
          variant='outlined'
          sx={{ height: '100%' }}
          placeholder='请输入要翻译的文本...'
          startDecorator={
            <div className='start-decorator-wrapper'>
              <IconButton onClick={() => setText('')} sx={{ ml: 'auto' }}>
                <IconDelete />
              </IconButton>
            </div>
          }
          endDecorator={
            <Typography level='body-sm' sx={{ ml: 'auto' }}>
              {text.length} character(s)
            </Typography>
          }
        />
        <div className='show-wrapper'>
          <Textarea value={targetText} minRows={10} maxRows={10} variant='outlined' />
          <div className='others'>
            <div style={{ margin: '5px 0' }}>其它方案</div>
            <div>
              <List marker='disc'>
                {alternatives &&
                  alternatives.map((alt) => (
                    <ListItem key={alt}>
                      <Typography level='body-sm' noWrap>
                        {alt}
                      </Typography>
                    </ListItem>
                  ))}
              </List>
            </div>
          </div>
        </div>
      </main>
      <Snackbar
        variant='solid'
        color='danger'
        autoHideDuration={1500}
        open={error !== ''}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {error}
      </Snackbar>
    </div>
  )
}

export default App
