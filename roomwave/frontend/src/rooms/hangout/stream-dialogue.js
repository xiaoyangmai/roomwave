'use strict';
window.streamDialogue={
  "schemaVersion": 1,
  "banter": {
    "giftRose": [
      [
        {
          "speaker": "lily",
          "text": "A rose! Our little stage is becoming a garden!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "Good. I remembered how to water exactly one plant.",
          "emotion": "neutral"
        }
      ],
      [
        {
          "speaker": "mia",
          "text": "That's a lovely rose. I saved a spot for it.",
          "emotion": "blush"
        },
        {
          "speaker": "lily",
          "text": "Right beside the world's shyest flower critic!",
          "emotion": "happy"
        }
      ],
      [
        {
          "speaker": "lily",
          "text": "Petal delivery! Five stars for excellent timing!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "The rose is blushing less than I am. Impressive.",
          "emotion": "blush"
        }
      ]
    ],
    "giftHeart": [
      [
        {
          "speaker": "lily",
          "text": "Look at that heart! Group hug, everyone!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "I'll supervise the hug. From inside the hug.",
          "emotion": "blush"
        }
      ],
      [
        {
          "speaker": "mia",
          "text": "That was sweet. My cool expression has resigned.",
          "emotion": "blush"
        },
        {
          "speaker": "lily",
          "text": "Application accepted! Smiley Mia starts today!",
          "emotion": "happy"
        }
      ],
      [
        {
          "speaker": "lily",
          "text": "One heart, three very happy hosts!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "Confirmed. One of us is simply quieter about it.",
          "emotion": "happy"
        }
      ]
    ],
    "giftDance": [
      [
        {
          "speaker": "lily",
          "text": "That deserves an imaginary disco ball!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "Excellent. My imaginary rhythm matches it.",
          "emotion": "neutral"
        }
      ],
      [
        {
          "speaker": "mia",
          "text": "I counted the steps. Then the steps escaped.",
          "emotion": "surprised"
        },
        {
          "speaker": "lily",
          "text": "We call that freestyle! Very exclusive moves!",
          "emotion": "happy"
        }
      ],
      [
        {
          "speaker": "lily",
          "text": "Mia, your tiny shoulder wiggle stole the show!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "It has requested its own dressing room.",
          "emotion": "neutral"
        }
      ]
    ],
    "rescued": [
      [
        {
          "speaker": "lily",
          "text": "We made it! Chat, that was incredible teamwork!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "I can breathe again. Very fond of that activity.",
          "emotion": "happy"
        }
      ],
      [
        {
          "speaker": "mia",
          "text": "Thanks for being there. Really.",
          "emotion": "blush"
        },
        {
          "speaker": "lily",
          "text": "Team us! I'm putting that on an imaginary banner!",
          "emotion": "happy"
        }
      ],
      [
        {
          "speaker": "lily",
          "text": "Emergency over! Deploying the victory smiles!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "Mine is small, but it passed inspection.",
          "emotion": "happy"
        }
      ]
    ],
    "matchingOutfits": [
      [
        {
          "speaker": "lily",
          "text": "Matching outfits! We planned this perfectly!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "We absolutely did not. Please keep that secret.",
          "emotion": "blush"
        }
      ],
      [
        {
          "speaker": "mia",
          "text": "Same outfit. Different volume settings.",
          "emotion": "neutral"
        },
        {
          "speaker": "lily",
          "text": "And together we're the perfect duet!",
          "emotion": "happy"
        }
      ],
      [
        {
          "speaker": "lily",
          "text": "Twinsies! Should we invent a team handshake?",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "Two steps maximum. I know our limits.",
          "emotion": "happy"
        }
      ]
    ],
    "firstOutfit": [
      [
        {
          "speaker": "lily",
          "text": "Our first wardrobe find! Tiny fashion parade!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "I'll walk very slowly. For dramatic effect.",
          "emotion": "blush"
        }
      ],
      [
        {
          "speaker": "mia",
          "text": "A new outfit. This calls for a small, brave pose.",
          "emotion": "blush"
        },
        {
          "speaker": "lily",
          "text": "And one enormous round of applause!",
          "emotion": "happy"
        }
      ],
      [
        {
          "speaker": "lily",
          "text": "The wardrobe adventure officially begins!",
          "emotion": "happy"
        },
        {
          "speaker": "mia",
          "text": "I packed one compliment. You both look lovely.",
          "emotion": "blush"
        }
      ]
    ]
  }
};

// Stella keeps her own dialogue alongside both of the original hosts.
const stellaBanter={
  giftRose:[
    [{speaker:'stella',text:'For me? That rose has made my day.',emotion:'blush'},{speaker:'mia',text:'It suits you. I saved you a little vase.',emotion:'happy'}],
    [{speaker:'stella',text:'Pink petals and a big smile. Thank you!',emotion:'happy'},{speaker:'lily',text:'The smile is definitely the best part!',emotion:'happy'}]
  ],
  giftHeart:[
    [{speaker:'stella',text:'Sending that heart right back to you!',emotion:'happy'},{speaker:'mia',text:'Excellent. A very efficient heart delivery.',emotion:'blush'}],
    [{speaker:'stella',text:'You’re making me blush. In a good way.',emotion:'blush'},{speaker:'lily',text:'We noticed! You look so happy!',emotion:'happy'}]
  ],
  giftDance:[
    [{speaker:'stella',text:'One more song? I’m just getting started!',emotion:'happy'},{speaker:'mia',text:'Give me one moment to find the beat again.',emotion:'happy'}],
    [{speaker:'stella',text:'That was my favourite little dance break.',emotion:'happy'},{speaker:'lily',text:'Encore! I’ll cheer from over here!',emotion:'happy'}]
  ],
  rescued:[
    [{speaker:'stella',text:'You came through for me. Thank you so much.',emotion:'blush'},{speaker:'mia',text:'You can relax now. We’re all here.',emotion:'happy'}],
    [{speaker:'stella',text:'Safe at last! That deserves a smile.',emotion:'happy'},{speaker:'lily',text:'Make that three smiles!',emotion:'happy'}]
  ],
  matchingOutfits:[
    [{speaker:'stella',text:'Our outfits match! Shall we do a little pose?',emotion:'happy'},{speaker:'mia',text:'Only if we agree which way to lean.',emotion:'blush'}],
    [{speaker:'stella',text:'We picked the same look. Good taste!',emotion:'happy'},{speaker:'lily',text:'Fashion team! I knew we’d get along!',emotion:'happy'}]
  ],
  firstOutfit:[
    [{speaker:'stella',text:'A new outfit! I’m ready for my close-up.',emotion:'happy'},{speaker:'mia',text:'Looking good. I’m practising my applause.',emotion:'blush'}],
    [{speaker:'stella',text:'A tiny wardrobe adventure. I love it.',emotion:'happy'},{speaker:'lily',text:'Next stop, our very own fashion show!',emotion:'happy'}]
  ]
};
for(const [context,lines] of Object.entries(stellaBanter))window.streamDialogue.banter[context].push(...lines);
