import { computed } from 'vue';

export function useModelWrapper(props, emit, name) {
  return computed({
    get: () => props[name],
    set: (value) => {
      emit(`update:${name}`, value);
    },
  });
}
