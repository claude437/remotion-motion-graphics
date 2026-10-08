#!/usr/bin/env bash
# Regenerates the original, royalty-free sample audio in public/audio/ with ffmpeg.
# The music bed runs at 120 BPM (one beat every 0.5 s) so visuals can sync to it
# using `beatPulse()` from src/lib/audio.ts.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/audio

# 16 s ambient pad (A minor add9) with a soft low "kick" on every beat.
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=exprs='\
0.10*sin(2*PI*110*t)*(0.8+0.2*sin(2*PI*0.25*t))\
+0.07*sin(2*PI*164.81*t)*(0.8+0.2*sin(2*PI*0.33*t))\
+0.06*sin(2*PI*220*t)*(0.8+0.2*sin(2*PI*0.2*t))\
+0.05*sin(2*PI*261.63*t)*(0.7+0.3*sin(2*PI*0.5*t))\
+0.04*sin(2*PI*493.88*t)*(0.6+0.4*sin(2*PI*0.125*t))\
+0.45*sin(2*PI*(52+40*exp(-mod(t,0.5)*30))*mod(t,0.5))*exp(-mod(t,0.5)*9)'\
:s=48000:d=16" \
  -af "lowpass=f=2400,afade=t=in:d=0.5,afade=t=out:st=14.5:d=1.5,alimiter=limit=0.9" \
  -ac 2 -c:a libmp3lame -b:a 192k public/audio/music-bed.mp3

# 0.9 s filtered-noise whoosh for scene transitions.
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:d=0.9:a=0.6:r=48000:seed=7" \
  -af "highpass=f=300,lowpass=f=5000,afade=t=in:d=0.55:curve=exp,afade=t=out:st=0.55:d=0.35,volume=3.2" \
  -ac 2 -c:a libmp3lame -b:a 192k public/audio/whoosh.mp3

# 0.12 s soft UI click for small elements landing.
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=exprs='\
0.5*sin(2*PI*1800*t)*exp(-t*90)+0.25*sin(2*PI*3400*t)*exp(-t*140)'\
:s=48000:d=0.12" \
  -af "highpass=f=600,afade=t=out:st=0.06:d=0.06" \
  -ac 2 -c:a libmp3lame -b:a 192k public/audio/click.mp3

# 0.7 s gentle low pulse for "signal" moments.
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=exprs='\
0.55*sin(2*PI*150*t)*exp(-t*6)+0.2*sin(2*PI*300*t)*exp(-t*9)'\
:s=48000:d=0.7" \
  -af "afade=t=in:d=0.015,lowpass=f=1200,afade=t=out:st=0.45:d=0.25" \
  -ac 2 -c:a libmp3lame -b:a 192k public/audio/pulse.mp3

echo "Wrote music-bed, whoosh, click and pulse to public/audio/"
