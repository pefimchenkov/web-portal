<template>
  <v-app>
  <v-navigation-drawer
    app
    temporary
    v-model="drawer"
   >
      <v-list>
          <v-list-tile
            :to="link.url"
            v-for="link of links"
            :key="link.title"
          >
            <v-list-tile-action>
              <v-icon>{{ link.icon }}</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title v-text="link.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
            @click="onLogout"
            v-if="isUserLoggedIn"
          >
            <v-list-tile-action>
              <v-icon>exit_to_app</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
  </v-navigation-drawer>
    <template>
  <v-toolbar dark color="primary">
    <v-toolbar-side-icon
      @click="drawer = !drawer"
      class="hidden-md-and-up"
    >

    </v-toolbar-side-icon>
    <v-toolbar-title>
      <router-link to="/" tag="span" class="pointer">WEB PORTAL - {{ userId }}</router-link>
    </v-toolbar-title>

    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">

      <v-btn flat
      v-for="link in links"
      :key="link.title"
      :to="link.url"
      >
        <v-icon
        left
        >
          {{ link.icon }}
        </v-icon>
        {{ link.title }}
      </v-btn>
      <v-btn
      flat
      @click="onLogout"
      v-if="isUserLoggedIn"
      >
      <v-icon left>
        exit_to_app
      </v-icon>
      Logout
      </v-btn>

    </v-toolbar-items>
  </v-toolbar>
</template>
  <v-content>
      <router-view></router-view>
  </v-content>
  <template v-if="error">

   <v-snackbar
      :timeout="5000"
      @input="closeError()"
      color="error"
      :value = "true"
    >
      {{ error }}
      <v-btn
        dark
        flat
        @click.native = "closeError()"
      >
        Close
      </v-btn>
    </v-snackbar>
  </template>

</v-app>
</template>

<script>
export default {
  data () {
    return {
      drawer: false
    }
  },
  methods: {
    closeError () {
      this.$store.dispatch('clearError')
    },
    onLogout () {
      this.$store.dispatch('LogoutUser')
      this.$router.push('/')
    }
  },
  computed: {
    error () {
      return this.$store.getters.error
    },
    userId () {
      if (this.$store.getters.isUserLoggedIn) {
        return this.$store.getters.user.id
      }
    },
    isUserLoggedIn () {
      return this.$store.getters.isUserLoggedIn
    },
    links () {
      if (this.isUserLoggedIn) {
        return [
          { title: 'Orders', icon: 'bookmark_border', url: '/orders' },
          { title: 'New Ad', icon: 'note_add', url: '/new' },
          { title: 'My Ads', icon: 'list', url: '/list' }
        ]
      }
      return [
          { title: 'Login', icon: 'lock', url: '/login' },
          { title: 'Registration', icon: 'face', url: '/registration' }
      ]
    }
  }
}
</script>

<style scouped>
.pointer {
  cursor: pointer;
}
</style>
