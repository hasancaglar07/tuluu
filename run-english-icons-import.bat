@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title TULU - English Icons Program Setup

REM Bu betik, ikon manifesti olusturur, (opsiyonel) ikonlari Blob'a yukler,
REM (opsiyonel) TTS sesleri uretir ve 5x5 dersi veritabanina import eder.

set BAT_DIR=%~dp0
pushd "%BAT_DIR%scripts" || (echo [HATA] scripts klasoru bulunamadi. & pause & exit /b 1)

echo [1/7] Node.js kontrolu...
where node >nul 2>&1 || (echo [HATA] Node.js bulunamadi. https://nodejs.org adresinden yukleyin. & pause & exit /b 1)
where npm  >nul 2>&1 || (echo [HATA] npm bulunamadi. Node kurulumu gerekli. & pause & exit /b 1)

echo [2/7] Bagimliliklar yukleniyor (npm install)...
call npm install || (echo [HATA] npm install basarisiz. & pause & exit /b 1)

echo [3/7] .env kontrolu...
if not exist ".env" (
  if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo [.env] olusturuldu. Gerekirse asagidaki degiskenleri duzenleyin:
    echo   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
    echo   TTS_PROVIDER=ELEVENLABS ^| AZURE
    echo   ELEVENLABS_API_KEY=...
    echo   ELEVENLABS_VOICE_ID=...
    echo   AZURE_SPEECH_KEY=...
    echo   AZURE_SPEECH_REGION=...
    echo   AZURE_SPEECH_VOICE=en-US-AnaNeural
    echo Devam etmek icin bir tusa basin...
    pause >nul
  ) else (
    echo [.env] bulunamadi ve .env.example yok. Upload/TTS adimlari atlanabilir.
  )
)

echo [4/7] Ikon manifesti olusturuluyor...
call npm run icons:manifest || (echo [HATA] Manifest olusturulamadi. & pause & exit /b 1)

echo [5/7] Blob upload (opsiyonel) icin token kontrolu...
findstr /B /C:"BLOB_READ_WRITE_TOKEN=" ".env" >nul
if errorlevel 1 (
  echo [BILGI] BLOB_READ_WRITE_TOKEN bulunamadi, upload atlanacak ve local file:// URL'ler kullanilacak.
) else (
  echo Upload islemini calistirmak istiyor musunuz? (Y/N)
  set /p DOUPLOAD=^>
  if /I "!DOUPLOAD!"=="Y" (
    call npm run icons:upload || echo [UYARI] Upload adiminda hata olustu, devam ediliyor...
  ) else (
    echo Upload atlandi.
  )
)

echo [6/7] TTS olusturma (opsiyonel) calistirilsin mi? (Y/N)
set /p DOTTS=^>
if /I "!DOTTS!"=="Y" (
  call npm run icons:tts || echo [UYARI] TTS adiminda hata olustu, devam ediliyor...
) else (
  echo TTS atlandi.
)

echo [7/7] Veritabanina import baslatiliyor...
call npm run import:english-icons || (echo [HATA] Import basarisiz. & pause & exit /b 1)

echo [OK] Tum adimlar tamamlandi.
popd
pause
endlocal
