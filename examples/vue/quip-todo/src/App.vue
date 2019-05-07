<template>
  <div>
    <todo-list :record="record.get('todo')"></todo-list>
  </div>
</template>

<script>
import TodoList from "./todo/TodoList.vue";

export default {
  components: { TodoList },
  data() {
    return {
      record: null
    };
  },
  created() {
    this.record = quip.apps.getRootRecord();
  }
};
</script>


<style scoped lang="less">
</style>

