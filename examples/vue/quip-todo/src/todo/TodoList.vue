<template>
  <div>
    <div class="todo-list-add">
      <input
        class="todo-list-add-label"
        type="text"
        placeholder="To do..."
        v-model="newTodo"
      />
      <button @click="addTodo">Add</button>
    </div>
    <div class="todo-list-items">
      <todo-list-item
        v-for="record in items.getRecords()"
        :key="record.getId()"
        :record="record"
        @remove="removeTodo"
      ></todo-list-item>
    </div>
  </div>
</template>

<script>
import quip from "quip";

import TodoListItem from "./TodoListItem.vue";
export default {
  components: {
    TodoListItem
  },
  props: ["record"],
  data() {
    return {
      newTodo: "",
      items: this.record.get("items")
    };
  },
  methods: {
    addTodo: function() {
      this.items.add({
        label: this.newTodo,
        completed: false
      });
      this.newTodo = "";
    },
    removeTodo: function(record) {
      this.items.remove(record);
    }
  }
};
</script>

<style scoped>
.todo-list-add {
  display: flex;
  flex-direction: row;
}

.todo-list-add-label {
  flex-grow: 1;
  margin-right: 1rem !important;
}

.todo-list-items {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}
</style>
