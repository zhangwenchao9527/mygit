<template>
  <el-row>
    <el-col :xs="4" :sm="5" :md="8" :lg="9" :xl="10"><div>&nbsp;</div></el-col>
    <el-col :xs="16" :sm="14" :md="8" :lg="6" :xl="4">
      <el-form :model="loginForm" status-icon :rules="rules" ref="loginForm" >
        <h3>系统登录</h3>
        <el-form-item  prop="username">
          <el-input type="text" v-model="loginForm.username" autocomplete="off" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" autocomplete="off" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;background: #505458;border: none" @click="login('loginForm')">登录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :xs="4" :sm="5" :md="8" :lg="9" :xl="10"><div >&nbsp;</div></el-col>
  </el-row>
</template>

<script>
export default {
  name: 'Login',
  data () {
    const checkUser = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('账号不能为空'))
      } else {
        if (this.loginForm.username !== '') {
          this.$refs.loginForm.validateField('password')
        }
        callback()
      }
    }
    const checkPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('密码不能为空'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          {validator: checkUser, trigger: 'blur'}
        ],
        password: [
          {validator: checkPassword, trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    login (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios
            .post('/api/login', {
              username: this.loginForm.username,
              password: this.loginForm.password
            })
            .then(successResponse => {
              if (successResponse.data.code === 200) {
                this.$store.commit('login', this.loginForm)
                const path = this.$route.query.redirect
                this.$router.replace({path: path === '/' || path === undefined ? '/index' : path})
              } else {
                this.$message({
                  showClose: true,
                  message: '账号和密码错误',
                  type: 'error',
                  offset: 100
                })
                return false
              }
            })
            .catch(failResponse => {
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
