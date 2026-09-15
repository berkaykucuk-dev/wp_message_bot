import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => {
    let savedUser = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) savedUser = JSON.parse(userStr);
    } catch (e) {}

    return {
      isDarkMode: false,
      token: localStorage.getItem('token') || null,
      user: savedUser
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    login(token: string, user: any) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getHeaders() {
      return {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': 'Bearer ' + this.token } : {})
      }
    }
  }
})