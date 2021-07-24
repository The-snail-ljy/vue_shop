<template>
  <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>

         <!-- 搜索与添加区域 -->
         <el-row :gutter="15">
             <el-col :span="10">
                <el-input placeholder="请输入内容"  class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList" ></el-button>
                </el-input>
             </el-col>
             <el-col :span="4"> 
                 <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
             </el-col>
         </el-row>
        <!-- 用户列表区域 -->
        <el-table :data="userList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态">
                <template slot-scope="scope">
                    <!-- scope是整一行的数据 -->
                    <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
                <template slot-scope="scope">
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="removeUserById(scope.row.id)"></el-button>
                    <!-- 分配角色按钮 -->
                    <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini" circle @click="setRole(scope.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </el-card>  
      <!-- 添加用户对话框 -->
      <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="addForm.userName"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog> 
        <!-- 修改用户的对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>    
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%" @close="setRoleDialogClosed">
            <div>
                <p>当前用户：{{userInfo.username}}</p>
                <p>当前角色：{{userInfo.role_name}}</p>
                <p>分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                        v-for="item in rolesList"
                        :key="item.id"
                        :label="item.roleName"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
    name: "Users",
    data() {
            //验证邮箱的自定义规则
            var checkEmail = (rule, value, callback) => {
                //验证邮箱的正则表达式
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                if(regEmail.test(value)) {
                    //合法邮箱
                    return callback()
                }
                callback(new Error('请输入合法的邮箱'))
            }
            //验证手机号的自定义规则
            var checkMobile = (rule, value, callback) => {
                //验证手机号的正则表达式
                const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if(regMobile.test(value)) {
                    return callback()
                }
                callback(new Error('请输入合法的手机号'))
            }
         return {
            //获取用户列表的参数对象
            queryInfo: {
                query: '',
                //当前页数
                pagenum: 1,
                //当前每页显示多少条数据
                pagesize: 5
            },
            userList: [],
            total: 0,
            //控制添加对话框的显示与隐藏
            addDialogVisible: false,
            //控制修改对话框的显示与隐藏
            editDialogVisible: false,
            //查询到的用户信息对象
            editForm: {},
            //添加用户的表单数据
            addForm: {
                userName: '',
                password: '',
                email: '',
                mobile: ''
            },
            //添加表单的验证规则对象
            addFormRules: {
                userName: [
                    {required:true, message:'请输入用户名', trigger: 'blur'},
                    {min: 3, max: 10, message:'用户名长度在3~10之间', trigger: 'blur'}
                ],
                password: [
                    {required:true, message:'请输入密码', trigger: 'blur'},
                    {min: 6, max: 15, message:'用户名长度在6~15之间', trigger: 'blur'}
                ],
                email: [
                    {required:true, message:'请输入邮箱', trigger: 'blur'},
                    {validator: checkEmail, trigger: 'blur'} 
                ],
                mobile: [
                    {required:true, message:'请输入手机号', trigger: 'blur'},
                    {validator: checkMobile, trigger: 'blur'} 
                    
                ]
            },
            //修改表单的验证规则对象
            editFormRules: {
                email: [
                    {required:true, message:'请输入邮箱', trigger: 'blur'},
                    {validator: checkEmail, trigger: 'blur'} 
                ],
                mobile: [
                    {required:true, message:'请输入手机号', trigger: 'blur'},
                    {validator: checkMobile, trigger: 'blur'}
                ]
            },
            //控制分配角色对话框的显示与隐藏
            setRoleDialogVisible: false,
            //需要被分配角色的用户信息
            userInfo: {},
            //所有角色的数据列表
            rolesList: [],
            selectedRoleId: ''
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
        const {data: res} =await this.$http.get('users', {params: this.queryInfo})
        if(res.meta.status != 200) {
            return this.$message.error('获取用户列表失败！')
        }
        this.userList = res.data.users
        this.total = res.data.total
        //console.log(res)
        },
        handleSizeChange(newSize) {
            //console.log(newSize)
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        handleCurrentChange(newPage) {
            //console.log(newPage)
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        //监听switch开关的状态改变
        async userStateChange(userInfo) {
            console.log(userInfo)
           const {data: res} =await this.$http.put(`user/${userInfo.id}/state/${userInfo.mg_state}`)
           console.log(res)
           if(res.meta.status !== 200) {
               userInfo.mg_state = !userInfo.mg_state
               return this.$message.error('更新用户状态失败！')
           }
           this.$message.success('更新用户状态成功！')
        },
        //监听添加用户对话框关闭事件  对话框关闭以后重置表单
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        //添加用户表单确定前的预校验
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                //console.log(valid)
                if(!valid) return
                //校验通过以后可以发起网络请求
                const {data: res} = await this.$http.post('users', this.addForm)
                if(res.meta.status !== 201) {
                    this.$message.error('添加用户失败！')
                }
                this.$message.success('添加用户成功！')
                //隐藏添加用户的对话框
                this.addDialogVisible = false
                //刷新用户列表
                this.getUserList()
            }) 
        },
        //展示用户编辑的对话框
        async showEditDialog(id) {
            const{data: res} =await this.$http.get('users/' + id)
            if(res.meta.status !== 200) {
                return this.$message.error('查询用户信息失败')
            }
            //console.log(res.data)
            this.editForm = res.data
            this.editDialogVisible = true
        },
        //监听修改对话框的关闭 并重置对话框
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        editUserInfo() {        
            this.$refs.editFormRef.validate(async valid => {
                //通过valid判断验证是否通过 
                if(!valid) return
                //如果验证通过了  那么发起修改用户信息的请求
                const {data: res} = await this.$http.put('users/' + this.editForm.id, {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('更新用户信息失败！')
                }
                //如果更新成功 则关闭对话框
                this.editDialogVisible = false
                //刷新数据列表
                this.getUserList()
                //提示修改成功
                this.$message.success('更新用户信息成功！')
            })
        },
        async removeUserById(id) {
            //console.log(id)
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            //如果用户确认删除，则返回值为字符串 confirm
            //如果用户取消删除，则返回值为字符串 cancel
            if(confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const {data: res} = await this.$http.delete('users/' + id)
            if(res.meta.status !== 200) {
                return this.$message.error('删除用户失败！')
            }
            this.$message.success('删除用户成功！')
            this.getUserList()
        },
        //展示分配角色的对话框
        async setRole(userInfo) {
            this.userInfo =userInfo
            const {data: res} = await this.$http.get('roles')
            if(res.meta.status !== 200) {
                this.$message.error('获取角色列表失败！')
            }
            this.rolesList = res.data
            this.setRoleDialogVisible = true
        },
        //点击确定按钮 分配角色
        async saveRoleInfo() {
            if(!this.selectedRoleId) {
                return this.$message.error('请选择要分配的角色！')
            }
            const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
                rid: this.selectedRoleId
            })
            if(res.meta.status !== 200) {
                return this.$message.error('更新角色失败！')
            }
            this.$message.success('更新角色成功！')
            this.getUserList()
            this.setRoleDialogVisible = false
        },
        //监听分配角色对话框关闭事件 重置对话框
        setRoleDialogClosed() {
            this.selectedRoleId = ''
            this.userInfo = {}
        }
    } 
}
</script>

<style scoped>

</style>>

