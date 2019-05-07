<template>
  <div
    class="badge"
    :style="{'background-color': badgeBackgroundColor}"
  >
    <div class="header">
      <div class="hello">
        Hello
      </div>
      <div class="nameLabel">
        your name is
      </div>
    </div>
    <div class="firstName">
      {{firstName}}
    </div>
    <div class="footer"></div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      firstName: quip.apps.getViewingUser().getFirstName(),
      badgeBackgroundColor: quip.apps.ui.ColorMap.RED.VALUE
    };
  },
};
</script>


<style scoped lang="less">
.badge {
  display: flex;
  flex-direction: column;
  background-color: red;
  border-radius: 4px;
  height: 200px;
  width: 340px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;

  .hello {
    text-transform: uppercase;
    font-size: 36px;
    letter-spacing: 4px;
    font-weight: bold;
  }

  .nameLabel {
    font-size: 14px;
    margin-top: -6px;
    margin-bottom: 10px;
  }
}

.firstName {
  display: flex;
  flex-direction: column;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  background-color: white;
  font-size: 24px;
  flex: 1;
}

.footer {
  height: 16px;
}
</style>

