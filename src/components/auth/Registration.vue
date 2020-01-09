<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md6>
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Регистрация</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                prepend-icon="person"
                name="email"
                label="Email"
                type="email"
                v-model="email"
                required
                :rules="emailRules"
              ></v-text-field>
              <v-text-field
                id="password"
                prepend-icon="lock"
                name="password"
                label="Пароль"
                type="password"
                :counter="6"
                v-model="password"
                :rules="passRules"
              ></v-text-field>
              <v-text-field
                id="confirm-password"
                prepend-icon="lock"
                name="confirm-password"
                label="Повторите пароль"
                type="password"
                :counter="6"
                v-model="confirmPassword"
                :rules="confirmPassRules"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="onSubmit()"
              :disabled="!valid || loading"
              :loading="loading"
            >Зарегистрироваться</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
	data () {
		return {
			email: '',
			password: '',
			confirmPassword: '',
			valid: false,
			emailRules: [
				v => !!v || 'E-mail - обязательный параметр',
				v => /.+@.+/.test(v) || 'E-mail должен быть правильного формата'
			],
			passRules: [
				v => !!v || 'Пароль - обязательный параметр',
				v =>
					(v && v.length >= 6) ||
					'Пароль должен быть больше или равен 6 символам!'
			],
			confirmPassRules: [
				v => !!v || 'Пароль - обязательный параметр',
				v => v === this.password || 'Пароль не совпадает!'
			]
		}
	},
	computed: {
		loading () {
			return this.$store.getters.loading
		}
	},
	methods: {
		onSubmit () {
			if (this.$refs.form.validate()) {
				const user = {
					email: this.email,
					password: this.password
				}
				this.$store
					.dispatch('registerUser', user)
					.then(() => {
						window.location.replace('/')
					})
					.catch(() => {})
			}
		}
	}
}
</script>
