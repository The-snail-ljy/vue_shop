<template>
  <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
          <!-- 头部警告区域 -->
          <el-alert
            title="注意：只允许为第三级分类设置相关参数！"
            type="warning" :closable="false" show-icon>
          </el-alert>

          <!-- 选择商品分类区域 -->
          <el-row class="cat_opt">
              <el-col>
                  <span>选择商品文本：</span>
                  <!-- 选择商品分类的级联选择框 -->
                  <el-cascader
                    v-model="selectedCateKeys"
                    :options="cateList"
                    :props="{ expandTrigger: 'hover', ...cateProps }"
                    @change="handleChange" clearable></el-cascader>
              </el-col>
          </el-row>
          <!-- tab 页签区域 -->
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
              <!-- 添加动态参数的面板 -->
            <el-tab-pane label="动态参数" name="many">
                <!-- 添加参数按钮 -->
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                            <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                            <!-- 输入的文本框 -->
                            <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <!-- 添加的按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="el-icon-edit" 
                            @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <!-- 添加静态属性的面板 -->
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                <!-- 静态参数表格 -->
                <el-table :data="onlyTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                            <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                            <!-- 输入的文本框 -->
                            <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <!-- 添加的按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="el-icon-edit" 
                            @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            </el-tabs>
      </el-card>

      <!-- 添加参数的对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
    data() {
        return {
            //商品分类列表
            cateList: [],
            //级联选择框的配置对象
            cateProps: {
                //选择的值
                value: 'cat_id',
                //看到的值
                label: 'cat_name',
                //父子节点的嵌套属性
                children: 'children',
            },
            //级联选择框双向绑定到的数组，也就是选择的那一项的id值
                selectedCateKeys: [],
                //被激活的页签的名称，first表示初始的时候是激活 name=‘first’ 这个页签
                activeName: 'many',
                //动态参数的数据
                manyTableData: [],
                //静态属性的数据
                onlyTableData: [],
                //控制添加对话框的显示与隐藏
                addDialogVisible: false,
                //添加参数的表单数据对象 
                addForm: {
                    attr_name: ''
                },
                //添加表单的验证对象
                addFormRules: {
                    attr_name: [
                        {required: true, message:'请输入参数名称', trigger: 'blur'}
                    ]
                },
                //控制修改对话框的显示与隐藏
                editDialogVisible: false,
                //修改的表单数据对象
                editForm: {},
                //修改表单的验证规则对象 
                editFormRules:{
                    attr_name: [
                        {required: true, message:'请输入参数名称', trigger: 'blur'}
                    ]
                },
                // // 控制按钮与文本输入框的切换显示 默认为显示按钮
                // inputVisible: false,
                // // 文本框中输入的内容
                // inputValue: ''

        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        //获取所有的商品分类列表
        async getCateList() {
            const {data: res} = await this.$http.get('categories')
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败！')
            }
            this.cateList = res.data
        },
        //级联选择框汇中项的变化会触发这个函数
        handleChange() {
           this.getParamsData()
        },
        //tab页签点击事件处理函数
        handleTabClick() {
            this.getParamsData()
        },
        //获取参数的列表数据
        async getParamsData() {
             //如果被选中的项的数组的长度不等于3,证明选中的不是三级分类
            if(this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return 
            }
            //如果通过  那么选中的是三级分类 则
            const{data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
            if(res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败！')
            }
            //console.log(res.data)
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                //控制文本框的显示与隐藏
                item.inputVisible = false
                // 文本框中输入的值
                item.inputValue = ''
            })
            if(this.activeName === 'many') {
                this.manyTableData = res.data
            }else {
                this.onlyTableData = res.data
            }
            //console.log(this.selectedCateKeys)
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        //点击确认按钮添加参数
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) return
                const{data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,
                {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if(res.meta.status !== 201) {
                    return this.$message.error('添加参数失败！')
                }
                this.$message.success('添加参数成功！')
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        //点击修改按钮，展示修改对话框
        async showEditDialog(attr_id) {
            //查询当前参数的信息
            const{data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, 
            {params: {attr_sel: this.activeName}})
            if(res.meta.status !== 200) {
                return this.$message.error('获取参数信息失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        //重置修改表单
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        //点击确认按钮发起修改参数请求
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if(!valid) return
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, 
                {attr_name: this.editForm.attr_name,
                 attr_sel: this.activeName})
                 if(res.meta.status !== 200) {
                     return this.$message.error('修改参数失败！')
                 }
                 this.$message.success('修改参数成功！')
                 this.getParamsData()
                 this.editDialogVisible = false
            })
        },
        // 根据id删除对应的参数项
        async removeParams(attr_id) {
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        // 如果返回的文本不是 confirm 那么就是取消删除
        if(confirmResult !== 'confirm') {
            return this.$message.info('已取消删除！')
        }
        // 如果返回的文本是 confirm 那么就是确认删除  则发起删除参数的网络请求
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if(res.meta.status !== 200) {
            return this.$message.error('删除参数失败！')
        }
        this.$message.success('删除参数成功！')
        this.getParamsData()
        },
        // 文本框按下 Enter 键或者失去焦点都会触发这个函数
        async handleInputConfirm(row) {
            if(row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            // 如果没有return ,则证明输入的内容合法，需要做后续处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 需要发起请求，保存这次操作
            this.saveAttrVals(row)
        },
        // 点击按钮，显示文本输入框
        showInput(row) {
            row.inputVisible = true
            //让文本框自动获得焦点
            // $nextTick 方法的作用，就是当页面上的元素被重新渲染完毕后
            // 才会指定回调函数中的代码
            this.$nextTick(_ => {
            this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 抽离出来的请求方法  将对attr_vals的操作保存到数据库
        async saveAttrVals(row){
            // 需要发起请求，保存这次操作
            const{data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' ')
            })
            if(res.meta.status !== 200) {
                return this.$message.error('修改参数失败！')
            }
            this.$message.success('修改参数成功！')
        },
        // 删除对应参数的可选项,i是索引
        handleClose(i,row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        }
    },
    computed: {
        //添加参数/属性的按钮的禁用与否
        isBtnDisabled() {
            if(this.selectedCateKeys.length !== 3) {
                return true
            }
            return false
        },
        //当前选中的三级分类的ID
        cateId() {
            if(this.selectedCateKeys.length == 3) {
                return this.selectedCateKeys[2]
            }
            return null
        },
        //动态计算标题的文本
        titleText() {
            if(this.activeName === 'many') {
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>

<style scoped>
.cat_opt {
    margin:15px 0px;
}

.el-tag {
    margin: 5px;
}

.input-new-tag {
    width: 120px;
    /* margin-left: 15px; */
}
</style>