// Google OAuth configuration and utilities
const GOOGLE_CLIENT_ID = '391369966433-8g60066elshv7ng8ejp23jgsntp63d12.apps.googleusercontent.com';

class GoogleAuthService {
  constructor() {
    this.gapi = null;
    this.auth2 = null;
    this.isInitialized = false;
  }

  // Initialize Google API
  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google API script
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          this.loadAuth2().then(resolve).catch(reject);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        this.loadAuth2().then(resolve).catch(reject);
      }
    });
  }

  // Load Auth2 library
  async loadAuth2() {
    return new Promise((resolve, reject) => {
      window.gapi.load('auth2', {
        callback: () => {
          window.gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
          }).then(() => {
            this.auth2 = window.gapi.auth2.getAuthInstance();
            this.isInitialized = true;
            resolve();
          }).catch(reject);
        },
        onerror: reject
      });
    });
  }

  // Sign in with Google
  async signIn() {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      const authResult = await this.auth2.signIn();
      const profile = authResult.getBasicProfile();
      const idToken = authResult.getAuthResponse().id_token;

      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        picture: profile.getImageUrl(),
        idToken: idToken
      };
    } catch (error) {
      throw new Error(error.error || 'Google sign-in failed');
    }
  }

  // Sign out
  async signOut() {
    if (this.auth2) {
      await this.auth2.signOut();
    }
  }

  // Check if user is signed in
  isSignedIn() {
    return this.auth2?.isSignedIn.get() || false;
  }
}

// Alternative implementation using Google Identity Services (newer approach)
class GoogleIdentityService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize Google Identity Services
  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          this.isInitialized = true;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        this.isInitialized = true;
        resolve();
      }
    });
  }

  // Sign in with popup
  async signInWithPopup() {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          try {
            // Get user info using the access token
            const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`);
            const userInfo = await userInfoResponse.json();
            
            resolve({
              ...userInfo,
              accessToken: response.access_token
            });
          } catch (error) {
            reject(error);
          }
        },
      }).requestAccessToken();
    });
  }

  // Sign in with credential (for ID token)
  async signInWithCredential() {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            // Decode the JWT token to get user info
            const payload = this.parseJwt(response.credential);
            resolve({
              id: payload.sub,
              name: payload.name,
              email: payload.email,
              picture: payload.picture,
              idToken: response.credential
            });
          } else {
            reject(new Error('No credential received'));
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Try manual sign-in
          this.renderSignInButton();
        }
      });
    });
  }

  // Render sign-in button
  renderSignInButton() {
    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'google-signin-button';
    document.body.appendChild(buttonDiv);

    window.google.accounts.id.renderButton(
      buttonDiv,
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with'
      }
    );

    // Clean up after use
    setTimeout(() => {
      if (buttonDiv.parentNode) {
        buttonDiv.parentNode.removeChild(buttonDiv);
      }
    }, 1000);
  }

  // Helper to parse JWT token
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error('Invalid token');
    }
  }
}

// Export both services
export const googleAuthService = new GoogleAuthService();
export const googleIdentityService = new GoogleIdentityService();

// Default export (recommended newer approach)
export default googleIdentityService;
