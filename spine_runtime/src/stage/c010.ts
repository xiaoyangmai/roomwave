import backgroundUrl from '../../../resources/assets/rooms-v1/room-balcony.lossless.webp?url'

// Runtime consumption of the existing c010 ZIP. Asset production stays outside this module.
export const c010 = {
  id: 'c010',
  model: { url: '/c010.zip', skin: '00' },
  idle: { name: 'idle', loop: true },
  reactions: { think: 'think', happy: 'delight', angry: 'angry' },
  speech: { start: 'talk_start', end: 'talk_end' },
  foam: {
    animation: 'foam_wipe',
    events: ['FoamNotice', 'FoamContact', 'FoamCleared', 'FoamComplete'],
    faceAnchor: 'foam_face_anchor',
    handAnchor: 'foam_palm_anchor',
  },
  mixSeconds: 0.2,
  view: {
    width: 960, height: 720, maxFps: 30,
    backgroundUrl,
  },
} as const

export type StageEmotion = keyof typeof c010.reactions
