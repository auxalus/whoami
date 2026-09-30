import React, { useState, useMemo } from 'react';

export function parseSongUrl(url) {
  if (!url || typeof url !== 'string') return null;
  var trimmed = url.trim();

  // Spotify Track / Album / Playlist / Episode
  if (trimmed.indexOf('open.spotify.com') !== -1) {
    var cleanUrl = trimmed.split('?')[0].split('#')[0];
    var parts = cleanUrl.split('/');
    for (var i = 0; i < parts.length - 1; i++) {
      var segment = parts[i];
      if (segment === 'track' || segment === 'album' || segment === 'playlist' || segment === 'episode') {
        var id = parts[i + 1];
        if (id) {
          return {
            platform: 'spotify',
            type: segment,
            id: id,
            originalUrl: trimmed,
            embedUrl: 'https://open.spotify.com/embed/' + segment + '/' + id + '?utm_source=generator&theme=0'
          };
        }
      }
    }
  }

  // YouTube Standard, Short, or Music URL
  if (trimmed.indexOf('youtube.com') !== -1 || trimmed.indexOf('youtu.be') !== -1) {
    var ytId = '';
    if (trimmed.indexOf('youtu.be/') !== -1) {
      var after = trimmed.split('youtu.be/')[1] || '';
      ytId = after.split('?')[0].split('&')[0].split('#')[0];
    } else if (trimmed.indexOf('watch?v=') !== -1) {
      var after = trimmed.split('watch?v=')[1] || '';
      ytId = after.split('&')[0].split('#')[0];
    } else if (trimmed.indexOf('embed/') !== -1) {
      var after = trimmed.split('embed/')[1] || '';
      ytId = after.split('?')[0].split('&')[0].split('#')[0];
    } else if (trimmed.indexOf('v/') !== -1) {
      var after = trimmed.split('v/')[1] || '';
      ytId = after.split('?')[0].split('&')[0].split('#')[0];
    }
    if (ytId && ytId.length >= 11) {
      ytId = ytId.substring(0, 11);
      return {
        platform: 'youtube',
        id: ytId,
        originalUrl: trimmed,
        embedUrl: 'https://www.youtube.com/embed/' + ytId + '?rel=0'
      };
    }
  }

  return null;
}

// ==========================================
// GOOGLE OAUTH CONFIGURATION (LINKED TO .env)
// Automatically loads from .env via import.meta.env / window.__ENV__
// ==========================================
export const GOOGLE_CLIENT_ID = 
  (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.GOOGLE_CLIENT_ID) ||
  (typeof window !== 'undefined' && window.GOOGLE_CLIENT_ID) ||
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID)) ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// Contributor Auth Session (Persisted in localStorage)
export function AddYoursView({ nextNumber, onAddStory, onDeleteStory, onSelectStory, userStories = [] }) {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem('contributor_auth_session_v1');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Google OAuth & Global Auth Error
  const [authError, setAuthError] = useState('');

  // Username & Password Auth States (Left Side)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [userPassError, setUserPassError] = useState('');

  // Phone OTP States (Right Side)
  const [phoneCountry, setPhoneCountry] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [phoneAuthError, setPhoneAuthError] = useState('');

  // Edit State
  const [editingStoryId, setEditingStoryId] = useState(null);

  // Form States
  const [photos, setPhotos] = useState(['', '', '']);
  const [name, setName] = useState(() => authUser ? (authUser.name || '') : '');
  const [paragraph, setParagraph] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [city, setCity] = useState('Montevideo');
  const [year, setYear] = useState(new Date().getFullYear());
  const [isDraggingSlot, setIsDraggingSlot] = useState(null);
  const [urlPromptSlot, setUrlPromptSlot] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successStory, setSuccessStory] = useState(null);

  const parsedSong = useMemo(() => parseSongUrl(songUrl), [songUrl]);

  // Find currently editing story if any
  const editingStory = useMemo(() => {
    if (!editingStoryId) return null;
    return userStories.find(s => s.id === editingStoryId) || null;
  }, [editingStoryId, userStories]);

  // Helper: Client-side canvas image compression to prevent LocalStorage Quota Exceeded
  const compressImageFile = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        callback(dataUrl);
      };
      img.onerror = () => {
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Decode JWT payload helper
  const decodeJwtPayload = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Google Identity Services button initialization
  useEffect(() => {
    if (!authUser && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID') && window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response && response.credential) {
              const payload = decodeJwtPayload(response.credential);
              if (payload) {
                const userSession = {
                  name: payload.name || payload.email.split('@')[0],
                  email: payload.email,
                  picture: payload.picture,
                  provider: 'google',
                  verified: true,
                  authTime: new Date().toISOString()
                };
                try {
                  localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
                } catch (e) {}
                setAuthUser(userSession);
                if (!name) setName(userSession.name);
                setAuthError('');
              }
            }
          }
        });

        const btnDiv = document.getElementById('gsi-official-button');
        if (btnDiv) {
          btnDiv.innerHTML = '';
          window.google.accounts.id.renderButton(btnDiv, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular'
          });
        }
      } catch (err) {
        console.warn('Google GSI render error:', err);
      }
    }
  }, [authUser]);

  // Handle Google OAuth Click
  const handleGoogleSignInClick = () => {
    setAuthError('');
    if (GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID') && window.google && window.google.accounts) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              })
                .then(res => res.json())
                .then(userInfo => {
                  const userSession = {
                    name: userInfo.name || userInfo.email.split('@')[0],
                    email: userInfo.email,
                    picture: userInfo.picture,
                    provider: 'google',
                    verified: true,
                    authTime: new Date().toISOString()
                  };
                  try {
                    localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
                  } catch (e) {}
                  setAuthUser(userSession);
                  if (!name) setName(userSession.name);
                })
                .catch(err => {
                  setAuthError('Failed to retrieve user profile from Google. Please try again.');
                });
            }
          },
          error_callback: (err) => {
            setAuthError('Google sign in popup closed.');
          }
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('Google GSI Token Client error:', err);
        setAuthError('Google OAuth error: ' + (err.message || 'Check origin configuration.'));
      }
    } else {
      setAuthError('Google Client ID is not configured in .env.');
    }
  };

  // Handle Username & Password Login
  const handleUserPassLogin = (e) => {
    e.preventDefault();
    setUserPassError('');
    if (!usernameInput.trim()) {
      setUserPassError('Please enter your username or email.');
      return;
    }
    if (!passwordInput.trim() || passwordInput.trim().length < 4) {
      setUserPassError('Please enter your password (minimum 4 characters).');
      return;
    }

    const userSession = {
      name: usernameInput.trim(),
      username: usernameInput.trim(),
      email: usernameInput.includes('@') ? usernameInput.trim() : (usernameInput.trim().toLowerCase().replace(/\s+/g, '.') + '@contributor.archive'),
      provider: 'credentials',
      verified: true,
      authTime: new Date().toISOString()
    };
    try {
      localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
    } catch (e) {}
    setAuthUser(userSession);
    if (!name) setName(userSession.name);
  };

  // Handle Phone OTP
  const handleSendOtp = () => {
    if (!phoneNumber.trim() || phoneNumber.trim().length < 6) {
      setPhoneAuthError('Please enter a valid phone number (at least 6 digits).');
      return;
    }
    setPhoneAuthError('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setPhoneAuthError('Invalid OTP code. Please enter the 6-digit code provided.');
      return;
    }
    const userSession = {
      phone: phoneCountry + ' ' + phoneNumber.trim(),
      name: 'Contributor (' + phoneCountry + ' ' + phoneNumber.trim() + ')',
      provider: 'phone',
      verified: true,
      authTime: new Date().toISOString()
    };
    try {
      localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
    } catch (e) {}
    setAuthUser(userSession);
    if (!name) setName(userSession.name);
    setPhoneAuthError('');
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('contributor_auth_session_v1');
    } catch (e) {
      console.warn('Auth clear error', e);
    }
    setAuthUser(null);
    setOtpSent(false);
    setEnteredOtp('');
    setAuthError('');
    setPhoneAuthError('');
    setUserPassError('');
    setEditingStoryId(null);
  };

  const handleFileChange = (slotIndex, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setErrorMessage('');
    compressImageFile(file, (optimizedDataUrl) => {
      setPhotos(prev => {
        const next = [...prev];
        next[slotIndex] = optimizedDataUrl;
        return next;
      });
    });
  };

  const handleRemovePhoto = (slotIndex) => {
    setPhotos(prev => {
      const next = [...prev];
      next[slotIndex] = '';
      return next;
    });
  };

  const handleSaveUrlPhoto = () => {
    if (urlPromptSlot !== null && urlInput.trim()) {
      setPhotos(prev => {
        const next = [...prev];
        next[urlPromptSlot] = urlInput.trim();
        return next;
      });
      setUrlPromptSlot(null);
      setUrlInput('');
    }
  };

  // Start editing an existing submission
  const handleStartEdit = (story) => {
    if (!story) return;
    setEditingStoryId(story.id);
    setName(story.name || '');
    setParagraph(story.bio?.en || story.storyText?.en || story.tagline?.en || '');
    
    // Populate photos
    const imgs = Array.isArray(story.images) && story.images.length > 0 
      ? story.images 
      : (story.image ? [story.image] : []);
    setPhotos([imgs[0] || '', imgs[1] || '', imgs[2] || '']);
    
    setSongUrl(story.songUrl || '');
    setCity(story.city || 'Montevideo');
    setYear(story.year || new Date().getFullYear());
    setSuccessStory(null);
    setErrorMessage('');

    // Smooth scroll to form container
    const formEl = document.getElementById('contributor-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStoryId(null);
    setPhotos(['', '', '']);
    setName(authUser ? (authUser.name || '') : '');
    setParagraph('');
    setSongUrl('');
    setCity('Montevideo');
    setYear(new Date().getFullYear());
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your name or memorial title.');
      return;
    }
    if (!paragraph.trim()) {
      setErrorMessage('Please write your paragraph or story.');
      return;
    }

    const validPhotos = photos.filter(Boolean);
    const defaultPlaceholder = 'https://images.prismic.io/197historiasilustradas/aaB68sFoBIGEg35F_figure-193.jpg?auto=format%2Ccompress&w=512&h=512&fit=crop';
    const primaryImage = validPhotos[0] || defaultPlaceholder;
    const allPhotos = validPhotos.length > 0 ? validPhotos : [primaryImage];

    if (editingStoryId) {
      // Update existing story
      const existing = userStories.find(s => s.id === editingStoryId);
      const storyId = editingStoryId;
      const codePad = existing?.codePad || String(storyId).padStart(3, '0');
      const number = existing?.number || storyId;

      const updatedStory = {
        ...(existing || {}),
        id: storyId,
        number: number,
        codePad: codePad,
        name: name.trim(),
        shortName: name.trim().split(' ')[0] || name.trim(),
        displayTitle: name.trim(),
        image: primaryImage,
        images: allPhotos,
        category: existing?.category || 'Inner Stories',
        city: city.trim() || 'Montevideo',
        year: parseInt(year, 10) || new Date().getFullYear(),
        placeOfBirth: city.trim() || 'Montevideo',
        dateOfBirth: existing?.dateOfBirth || 'Living Memory',
        placeOfDisappearance: existing?.placeOfDisappearance || 'Living Archive',
        dateOfDisappearance: existing?.dateOfDisappearance || 'Present & Remembered',
        calculatedAge: existing?.calculatedAge || 'Eternal Presence',
        artist: name.trim() + (authUser ? ' (@' + (authUser.name || authUser.username || 'Contributor') + ')' : ' (Self-Contribution)'),
        songUrl: songUrl.trim(),
        songPlatform: parsedSong ? parsedSong.platform : null,
        songEmbedUrl: parsedSong ? parsedSong.embedUrl : null,
        tagline: {
          es: paragraph.trim().slice(0, 90) + (paragraph.length > 90 ? '...' : ''),
          en: paragraph.trim().slice(0, 90) + (paragraph.length > 90 ? '...' : '')
        },
        bio: {
          es: paragraph.trim(),
          en: paragraph.trim()
        },
        storyText: {
          es: paragraph.trim(),
          en: paragraph.trim()
        },
        isUserSubmitted: true,
        contributorAuth: authUser ? authUser.provider : (existing?.contributorAuth || 'verified'),
        submittedAt: existing?.submittedAt || new Date().toLocaleDateString(),
        lastEditedAt: new Date().toLocaleDateString()
      };

      onAddStory(updatedStory);
      setSuccessStory(updatedStory);
      setEditingStoryId(null);
    } else {
      // Create new story
      const codePad = String(nextNumber).padStart(3, '0');
      const newStory = {
        id: nextNumber,
        number: nextNumber,
        codePad: codePad,
        name: name.trim(),
        shortName: name.trim().split(' ')[0] || name.trim(),
        displayTitle: name.trim(),
        image: primaryImage,
        images: allPhotos,
        category: 'Inner Stories',
        city: city.trim() || 'Montevideo',
        year: parseInt(year, 10) || new Date().getFullYear(),
        placeOfBirth: city.trim() || 'Montevideo',
        dateOfBirth: 'Living Memory',
        placeOfDisappearance: 'Living Archive',
        dateOfDisappearance: 'Present & Remembered',
        calculatedAge: 'Eternal Presence',
        artist: name.trim() + (authUser ? ' (@' + (authUser.name || authUser.username || 'Contributor') + ')' : ' (Self-Contribution)'),
        songUrl: songUrl.trim(),
        songPlatform: parsedSong ? parsedSong.platform : null,
        songEmbedUrl: parsedSong ? parsedSong.embedUrl : null,
        tagline: {
          es: paragraph.trim().slice(0, 90) + (paragraph.length > 90 ? '...' : ''),
          en: paragraph.trim().slice(0, 90) + (paragraph.length > 90 ? '...' : '')
        },
        bio: {
          es: paragraph.trim(),
          en: paragraph.trim()
        },
        storyText: {
          es: paragraph.trim(),
          en: paragraph.trim()
        },
        isUserSubmitted: true,
        contributorAuth: authUser ? authUser.provider : 'verified',
        submittedAt: new Date().toLocaleDateString()
      };

      onAddStory(newStory);
      setSuccessStory(newStory);
    }
  };

  const handleResetForm = () => {
    setEditingStoryId(null);
    setPhotos(['', '', '']);
    setName(authUser ? (authUser.name || '') : '');
    setParagraph('');
    setSongUrl('');
    setCity('Montevideo');
    setYear(new Date().getFullYear());
    setSuccessStory(null);
    setErrorMessage('');
  };

  // =========================================================================
  // VIEW 1: AUTHENTICATION GATE (SIDE-BY-SIDE PROTOCOL A & B)
  // =========================================================================
  if (!authUser) {
    return (
      <div className="font-mono text-black max-w-5xl mx-auto py-6 md:py-10 px-4 animate-fadeIn">
        {/* Header */}
        <div className="border-b-2 border-black pb-6 mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[11px] font-mono font-bold tracking-wider uppercase mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ARCHIVAL REGISTRY // CONTRIBUTOR AUTHENTICATION
          </div>
          <h1 className="text-2xl md:text-4xl font-mono font-bold text-black tracking-tight uppercase">
            SIGN IN TO CONTRIBUTE YOUR STORY
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-600 max-w-2xl mx-auto mt-2 leading-relaxed">
            Verify your contributor identity using Google OAuth, Username & Password, or Phone SMS OTP to unlock entry #{String(nextNumber).padStart(3, '0')}.
          </p>
        </div>

        {/* Global Error Notice if any */}
        {authError && (
          <div className="mb-6 p-3 bg-red-50 border-2 border-red-600 text-red-800 text-xs font-mono font-medium">
            ⚠ {authError}
          </div>
        )}

        {/* Main 2-Column Side-by-Side Gateway */}
        <div className="bg-white border-2 border-black shadow-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-black">
          
          {/* LEFT SIDE: GOOGLE OAUTH & USERNAME / PASSWORD */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/15 mb-6 font-mono text-xs">
                <span className="font-bold uppercase tracking-wider text-black flex items-center gap-2">
                  <span>[ OPTION 1 ]</span> GOOGLE / USERNAME
                </span>
                <span className="text-neutral-400 text-[10px]">OAUTH 2.0 & DIRECT</span>
              </div>

              {/* 1. Google OAuth */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-bold uppercase text-neutral-600">
                  INSTANT GOOGLE SIGN-IN:
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 text-black border-2 border-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  LOGIN WITH GOOGLE
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/15"></div>
                </div>
                <span className="relative bg-white px-3 font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-widest">
                  OR USE USERNAME & PASSWORD
                </span>
              </div>

              {/* 2. Username & Password Form */}
              <form onSubmit={handleUserPassLogin} className="space-y-3.5">
                {userPassError && (
                  <div className="p-2.5 bg-red-50 border border-red-500 text-red-700 text-xs font-mono">
                    ⚠ {userPassError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                    USERNAME OR EMAIL
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => { setUsernameInput(e.target.value); setUserPassError(''); }}
                    placeholder="e.g. Elena Rostova or elena@archive.org"
                    className="w-full bg-white border border-black px-3 py-2.5 font-mono text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setUserPassError(''); }}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-black px-3 py-2.5 font-mono text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-black text-white hover:bg-neutral-800 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>[ SIGN IN / CONTINUE → ]</span>
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-black/10 font-mono text-[11px] text-neutral-400 flex items-center justify-between">
              <span>CONTRIBUTOR CREDENTIALS</span>
              <span>DIRECT GATEWAY</span>
            </div>
          </div>

          {/* RIGHT SIDE: LOGIN WITH PHONE OTP */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 bg-neutral-50/60">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/15 mb-6 font-mono text-xs">
                <span className="font-bold uppercase tracking-wider text-black flex items-center gap-2">
                  <span>[ OPTION 2 ]</span> LOGIN WITH PHONE OTP
                </span>
                <span className="text-neutral-400 text-[10px]">SMS 2FA VERIFICATION</span>
              </div>

              {phoneAuthError && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-500 text-red-700 text-xs font-mono">
                  ⚠ {phoneAuthError}
                </div>
              )}

              {!otpSent ? (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-600 font-mono leading-relaxed">
                    Authenticate via your mobile number. A 6-digit verification code will be sent to confirm your contributor identity.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                      ENTER MOBILE NUMBER
                    </label>
                    <div className="flex gap-2">
                      <div className="bg-neutral-100 border border-black px-3 py-2.5 font-mono text-xs font-bold flex items-center gap-1.5 select-none text-neutral-800">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); setPhoneAuthError(''); }}
                        placeholder="98765 43210"
                        className="flex-1 bg-white border border-black px-3 py-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-3 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <span>[ SEND SMS OTP CODE → ]</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-emerald-50 border border-emerald-500 text-emerald-800 text-xs font-mono space-y-1">
                    <div>SMS verification code sent to <strong>{phoneCountry} {phoneNumber}</strong></div>
                    <div className="text-[11px] text-emerald-700 flex items-center justify-between">
                      <span>Code: <strong>{generatedOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setEnteredOtp(generatedOtp)}
                        className="underline hover:text-emerald-900 font-bold"
                      >
                        [ Auto-fill ]
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                      ENTER 6-DIGIT OTP CODE
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, '')); setPhoneAuthError(''); }}
                      placeholder="••••••"
                      className="w-full bg-white border border-black px-3 py-3 text-center tracking-[0.5em] font-mono text-xl font-bold focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="flex-1 py-3 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider transition-all"
                    >
                      [ VERIFY & PROCEED → ]
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setEnteredOtp(''); }}
                      className="px-3 py-3 border border-black text-xs font-mono hover:bg-neutral-100"
                    >
                      EDIT NO.
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/10 font-mono text-[11px] text-neutral-400 flex items-center justify-between">
              <span>SMS CARRIER GATEWAY</span>
              <span>VERIFIED 2FA</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED ADD YOURS SUBMISSION FORM (OR EDIT VIEW)
  // =========================================================================
  return (
    <div id="contributor-form-container" className="font-mono text-black">
      {/* Authenticated Contributor Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 border border-black mb-8 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            VERIFIED CONTRIBUTOR: <strong>{authUser.name || authUser.phone}</strong> {authUser.email ? `(${authUser.email})` : ''}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-black text-white font-bold uppercase tracking-wider">
            {authUser.provider === 'google' ? 'GOOGLE OAUTH' : (authUser.provider === 'phone' ? 'PHONE OTP' : 'CREDENTIALS')}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-[11px] underline hover:opacity-70 uppercase font-mono"
        >
          [ SIGN OUT ⎋ ]
        </button>
      </div>

      {/* Header Banner with Assigned Registry Number or Edit State */}
      <div className="border-b border-black/15 pb-8 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          {editingStory ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-black text-[12px] font-mono font-bold tracking-wider uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
              EDITING ARCHIVE REGISTRY NO. #{editingStory.codePad || String(editingStory.id).padStart(3, '0')}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[12px] font-mono font-bold tracking-wider uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ASSIGNED ARCHIVE REGISTRY NO. #{String(nextNumber).padStart(3, '0')}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {editingStory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs px-2.5 py-1 border border-black bg-white hover:bg-neutral-100 font-bold uppercase"
              >
                [ ✕ CANCEL EDIT ]
              </button>
            )}
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
              PERMANENT LIVING ARCHIVE
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-black tracking-tight mb-2">
          {editingStory ? `Edit Story: ${editingStory.name}` : 'Add Your Story to the Memorial'}
        </h1>
        <p className="text-sm font-serif text-neutral-600 max-w-2xl leading-relaxed">
          {editingStory 
            ? `Updating your existing memorial record #${editingStory.codePad || editingStory.id}. Changes will immediately refresh in the gallery and local archive.`
            : 'Contribute your personal memory, portrait, and voice. Every submission receives a permanent assigned sequential number in the archive alongside the 197 illustrated stories.'}
        </p>
      </div>

      {/* Success Banner */}
      {successStory && (
        <div className="bg-white border-2 border-black p-6 md:p-8 shadow-2xl mb-12 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-6">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm uppercase tracking-wide">
              <span>✓</span> ENTRY #{successStory.codePad} SAVED SUCCESSFULLY
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              {successStory.lastEditedAt ? `Last edited: ${successStory.lastEditedAt}` : successStory.submittedAt}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start">
            <div className="aspect-square bg-[#eae8e2] border border-black/20 overflow-hidden">
              <img src={successStory.image} alt={successStory.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <div className="text-xs text-neutral-500 font-mono">
                #{successStory.codePad} // {successStory.city} ({successStory.year})
              </div>
              <h3 className="text-2xl font-serif font-bold text-black">{successStory.name}</h3>
              <p className="font-mono text-xs text-neutral-700 line-clamp-3 leading-relaxed whitespace-pre-line">
                {successStory.bio.en}
              </p>
              {successStory.songEmbedUrl && (
                <div className="text-xs font-mono text-emerald-700 font-semibold pt-1 flex items-center gap-1.5">
                  <span>🎵</span> {successStory.songPlatform.toUpperCase()} SONG LINKED
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-black/10">
            <button
              onClick={() => onSelectStory(successStory)}
              className="px-6 py-3 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md"
            >
              [ VIEW YOUR STORY DETAIL ↗ ]
            </button>
            <button
              onClick={() => handleStartEdit(successStory)}
              className="px-5 py-3 border border-black bg-amber-50 hover:bg-amber-100 text-black text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1"
            >
              <span>✎</span> [ EDIT THIS ENTRY ]
            </button>
            <button
              onClick={handleResetForm}
              className="px-5 py-3 border border-black text-black hover:bg-black hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition-all"
            >
              [ + ADD ANOTHER ENTRY ]
            </button>
          </div>
        </div>
      )}

      {/* Submission / Edit Form */}
      {!successStory && (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-black p-6 md:p-10 shadow-sm">
          
          {editingStory && (
            <div className="p-3 bg-amber-50 border border-amber-400 text-amber-900 text-xs font-mono flex items-center justify-between">
              <span>✎ You are currently editing entry #{editingStory.codePad} ({editingStory.name}).</span>
              <button type="button" onClick={handleCancelEdit} className="underline font-bold">[✕ Cancel Edit]</button>
            </div>
          )}

          {/* Photo Upload Slots (3 Slots) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider font-mono">
                01. UPLOAD PHOTOS (3 SLOTS)
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {photos.filter(Boolean).length} of 3 uploaded (Optional)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((slotIdx) => {
                const slotTitles = ['PHOTO 01 (PRIMARY)', 'PHOTO 02 (CONTEXT)', 'PHOTO 03 (DETAIL)'];
                const photo = photos[slotIdx];
                const isDragging = isDraggingSlot === slotIdx;

                return (
                  <div key={slotIdx} className="space-y-2">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                      {slotTitles[slotIdx]}
                    </div>

                    {photo ? (
                      <div className="relative aspect-square border border-black bg-[#eae8e2] overflow-hidden group shadow-sm">
                        <img src={photo} alt={"Slot " + (slotIdx + 1)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                          <span className="text-white text-[11px] font-mono uppercase font-bold">PHOTO 0{slotIdx + 1} READY</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(slotIdx)}
                            className="px-3 py-1 bg-white text-black hover:bg-red-50 text-[11px] font-mono uppercase font-bold border border-black shadow-sm"
                          >
                            [ ✕ REMOVE ]
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingSlot(slotIdx); }}
                        onDragLeave={() => setIsDraggingSlot(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingSlot(null);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileChange(slotIdx, e.dataTransfer.files[0]);
                          }
                        }}
                        className={'relative aspect-square border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer ' +
                          (isDragging ? 'border-black bg-black/10 scale-[1.02]' : 'border-neutral-300 hover:border-black bg-neutral-50 hover:bg-white')}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(slotIdx, e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Upload photo"
                        />
                        <div className="pointer-events-none space-y-1.5">
                          <div className="text-2xl text-neutral-400">📷</div>
                          <div className="text-xs font-bold font-mono text-black">
                            CLICK OR DROP
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            PNG, JPG, WEBP
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUrlPromptSlot(slotIdx);
                          }}
                          className="mt-2 text-[10px] underline text-neutral-600 hover:text-black font-mono relative z-10"
                        >
                          or paste URL
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Optional URL input modal/inline prompt */}
            {urlPromptSlot !== null && (
              <div className="p-4 bg-neutral-100 border border-black space-y-2 mt-2">
                <div className="text-xs font-mono font-bold uppercase">
                  PASTE IMAGE URL FOR PHOTO 0{urlPromptSlot + 1}:
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.example.com/photo.jpg"
                    className="flex-1 bg-white border border-black px-3 py-1.5 font-mono text-xs text-black"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUrlPhoto}
                    className="px-4 py-1.5 bg-black text-white text-xs font-mono font-bold uppercase"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUrlPromptSlot(null); setUrlInput(''); }}
                    className="px-3 py-1.5 border border-black text-xs font-mono"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Your Name */}
          <div className="space-y-2">
            <label htmlFor="user-name-src" className="block text-xs font-bold uppercase tracking-wider font-mono">
              02. YOUR NAME / MEMORIAL ENTRY TITLE <span className="text-red-500">*</span>
            </label>
            <input
              id="user-name-src"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Gonzalez or Memorial Subject Name"
              className="w-full bg-white border border-black px-4 py-3 font-mono text-sm text-black placeholder-neutral-400 outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Your Paragraph */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="user-paragraph-src" className="block text-xs font-bold uppercase tracking-wider font-mono">
                03. YOUR PARAGRAPH / STORY <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {paragraph.length} chars | {paragraph.trim() ? paragraph.trim().split(' ').filter(Boolean).length : 0} words
              </span>
            </div>
            <textarea
              id="user-paragraph-src"
              rows={6}
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="Write your paragraph, remembrance, favorite memory, dedication, or personal reflection..."
              className="w-full bg-white border border-black p-4 font-mono text-xs md:text-sm text-black placeholder-neutral-400 outline-none focus:ring-2 focus:ring-black leading-relaxed"
              required
            />
          </div>

          {/* Favourite Song (Spotify or YouTube) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="user-song-src" className="block text-xs font-bold uppercase tracking-wider font-mono">
                04. FAVOURITE SONG (SPOTIFY OR YOUTUBE URL)
              </label>
              {parsedSong && (
                <span className={'text-[11px] font-mono font-bold px-2 py-0.5 rounded border ' + 
                  (parsedSong.platform === 'spotify' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-red-600 bg-red-50 text-red-700')}>
                  {parsedSong.platform === 'spotify' ? '🟢 SPOTIFY TRACK VERIFIED' : '🔴 YOUTUBE VIDEO VERIFIED'}
                </span>
              )}
            </div>
            <input
              id="user-song-src"
              type="url"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
              className="w-full bg-white border border-black px-4 py-3 font-mono text-sm text-black placeholder-neutral-400 outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-[11px] text-neutral-500 font-mono">
              Paste a Spotify track URL (e.g. open.spotify.com/track/...) or YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...).
            </p>

            {/* Live Song Embed Preview */}
            {parsedSong && (
              <div className="mt-3 p-3 bg-neutral-100 border border-black/20 rounded animate-fadeIn">
                <div className="text-[10px] text-neutral-500 uppercase font-mono mb-2">
                  LIVE SONG EMBED PREVIEW:
                </div>
                <iframe
                  src={parsedSong.embedUrl}
                  width="100%"
                  height={parsedSong.platform === 'spotify' ? "80" : "152"}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded border border-black/10 bg-white block w-full"
                ></iframe>
              </div>
            )}
          </div>

          {/* City and Year metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] text-neutral-600 uppercase font-mono">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Montevideo, Buenos Aires, Mumbai, etc."
                className="w-full bg-white border border-black/40 px-3 py-2 font-mono text-xs text-black outline-none focus:border-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] text-neutral-600 uppercase font-mono">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white border border-black/40 px-3 py-2 font-mono text-xs text-black outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-500 text-red-700 text-xs font-mono flex items-center justify-between">
              <span>⚠ {errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage('')} className="hover:underline font-bold">[✕]</button>
            </div>
          )}

          {/* Submit Button & Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-black/15">
            <button
              type="submit"
              className="px-8 py-4 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-md active:scale-[0.99]"
            >
              {editingStory ? '[ SAVE CHANGES TO ARCHIVE ENTRY → ]' : '[ SUBMIT TO MEMORIAL ARCHIVE → ]'}
            </button>
            
            {editingStory ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-4 border border-black text-black hover:bg-neutral-100 text-xs font-mono tracking-wider uppercase transition-all"
              >
                [ CANCEL EDIT ]
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-4 border border-black/30 hover:border-black text-neutral-700 hover:text-black text-xs font-mono tracking-wider uppercase transition-all"
              >
                [ CLEAR FORM ]
              </button>
            )}
          </div>

        </form>
      )}

      {/* User's Previous Submissions Section */}
      {userStories.length > 0 && (
        <div className="mt-16 pt-10 border-t-2 border-black">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-black">
              Your Contributions ({userStories.length})
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              SAVED IN LOCAL REGISTRY &bull; CLICK TO VIEW OR EDIT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userStories.map((story) => {
              const isCurrentlyEditing = editingStoryId === story.id;

              return (
                <div
                  key={story.id}
                  className={'border bg-white p-4 transition-all flex flex-col justify-between ' + 
                    (isCurrentlyEditing ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/20' : 'border-black hover:shadow-lg')}
                >
                  <div onClick={() => onSelectStory(story)} className="cursor-pointer group">
                    <div className="aspect-square bg-[#eae8e2] overflow-hidden mb-3 border border-black/10 relative">
                      <img src={story.image} alt={story.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {isCurrentlyEditing && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.5">
                          EDITING NOW
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 mb-1">
                      #{story.codePad} // {story.city} ({story.year})
                    </div>
                    <div className="font-bold text-sm text-black truncate mb-2">
                      {story.name}
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 font-mono leading-relaxed">
                      {story.bio.en}
                    </p>

                    {story.songEmbedUrl && (
                      <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                        <span>🎵</span> {story.songPlatform.toUpperCase()} SONG LINKED
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for the Contributor's Story */}
                  <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(story);
                      }}
                      className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>✎</span> EDIT ENTRY
                    </button>
                    {onDeleteStory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to remove entry #${story.codePad} (${story.name}) from the archive?`)) {
                            onDeleteStory(story.id);
                            if (editingStoryId === story.id) handleCancelEdit();
                            if (successStory?.id === story.id) setSuccessStory(null);
                          }
                        }}
                        className="px-2.5 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 text-[10px] font-mono uppercase tracking-wider transition-all"
                      >
                        REMOVE
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}