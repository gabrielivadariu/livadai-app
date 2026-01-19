// Lightweight event bus using a simple JS emitter to avoid native module requirements
class TinyEmitter {
  constructor() {
    this.listeners = {};
  }
  addListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(fn);
  }
  removeListener(event, fn) {
    if (this.listeners[event]) this.listeners[event].delete(fn);
  }
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((fn) => {
        try {
          fn(...args);
        } catch (_e) {
          // swallow
        }
      });
    }
  }
}

const emitter = new TinyEmitter();

export const REFRESH_EXPERIENCES = "REFRESH_EXPERIENCES";
export const REFRESH_HOST_PROFILE = "REFRESH_HOST_PROFILE";

export const emitRefreshExperiences = () => emitter.emit(REFRESH_EXPERIENCES);

export const subscribeRefreshExperiences = (handler) => {
  emitter.addListener(REFRESH_EXPERIENCES, handler);
  return () => emitter.removeListener(REFRESH_EXPERIENCES, handler);
};

export const emitRefreshHostProfile = () => emitter.emit(REFRESH_HOST_PROFILE);

export const subscribeRefreshHostProfile = (handler) => {
  emitter.addListener(REFRESH_HOST_PROFILE, handler);
  return () => emitter.removeListener(REFRESH_HOST_PROFILE, handler);
};

export default emitter;
