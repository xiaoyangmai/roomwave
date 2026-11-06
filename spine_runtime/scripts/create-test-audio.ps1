$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SetOutputToWaveFile((Join-Path (Split-Path $PSScriptRoot -Parent) 'public\speech.wav'))
$voice.Speak('Hello. I am C zero one zero. This is a voice playback test. You can change my expression while I speak, or interrupt me at any time.')
$voice.Dispose()
