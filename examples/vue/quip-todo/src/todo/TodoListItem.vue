<template>
  <div class="todo-list-item">
    <input
      class="todo-list-item-checkbox"
      @click="toggleCompleted"
      type="checkbox"
      v-model="completed"
    >
    <div
      class="todo-list-item-label"
      :class="{'todo-list-item-completed': this.completed}"
    >{{label}}</div>
    <button @click="$emit('remove', record)">Remove</button>
  </div>
</template>

<script>
export default {
  props: ["record"],
  data() {
    return {
      label: this.record.get("label"),
      completed: this.record.get("completed")
    };
  },
  methods: {
    toggleCompleted: function() {
      this.record.set("completed", !this.record.get("completed"));
    }
  }
};
</script>

<style>
.todo-list-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: .5rem;
}

.todo-list-item-checkbox {
  position: relative;
  top: .25rem;
}

.todo-list-item-label {
  margin: 0  1rem;
  flex: 1;
  flex-grow: 1;
}

.todo-list-item-completed {
  text-decoration: line-through;
}
</style>
