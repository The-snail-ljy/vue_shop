<template>
    <div>
        <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
          <el-alert
            title="添加商品信息"
            type="info" show-icon :closable="false" center>
          </el-alert>
          <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
            <el-step title="商品信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
          </el-steps>

          <!-- tab栏区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
          <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
            <el-tab-pane label="商品信息" name="0">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="addForm.goods_price" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="addForm.goods_weight" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="addForm.goods_number" type="number"></el-input>
                </el-form-item> 
                <el-form-item label="商品分类" prop="goods_cat">
                    <el-cascader
                    v-model="addForm.goods_cat"
                    :options="cateList"
                    :props="{ expandTrigger: 'hover', ...cateProps}"
                    @change="handleChange"></el-cascader>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
                <!-- 渲染参数表单的item项 -->
                <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                    <!-- 复选框组 -->
                    <el-checkbox-group v-model="item.attr_vals">
                        <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
                <el-form-item :label="item.attr_name" v-for="item in this.onlyTableData" :key="item.attr_id">
                    <el-input v-model="item.attr_vals"></el-input>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
                <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="5">
                <!-- 富文本编辑器组件 -->
                <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>

      <!-- 图片预览 -->
      <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="50%">
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    data() {
        return {
            // 当前活跃的分页索引
            activeIndex: 0,
            // 添加商品的表单数据对象
            addForm: {
                goods_name: '',
                goods_price: '',
                goods_weight: '',
                goods_number: '',
                // 商品所属的分类数组
                goods_cat: [],
                // 图片的数组  存放图片的临时路径
                pics: [],
                // 商品的详情描述
                goods_introduce: '',
                // 动态参数和静态属性
                attrs: []
            },
            // 表单的验证规则对象
            addFormRules: {
                goods_name: [
                    {required: true, message: '请输入商品名称', trigger: 'blur'}
                ],
                goods_price: [
                    {required: true, message: '请输入商品价格', trigger: 'blur'}
                ],
                goods_weight: [
                    {required: true, message: '请输入商品重量', trigger: 'blur'}
                ],
                goods_weight: [
                    {required: true, message: '请输入商品数量', trigger: 'blur'}
                ],
                goods_cat: [
                    {required: true, message: '请选择商品分类', trigger: 'blur'}
                ]
            },
            // 储存获取到的分类列表数据
            cateList: [],
            // 分类列表的配置数据
            cateProps: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            }, 
            //动态商品参数列表数据
            manyTableData: [],
            // 商品静态属性列表数据
            onlyTableData : [],
            // 上传图片的URL地址
            uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
            // 图片上传组件headers请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 图片预览的url地址
            previewPath: '',
            // 图片默认为隐藏
            previewVisible: false

        }
    }, 
    created() {
        this.getGoodsList()
    },
    methods: {
        async getGoodsList() {
            const{data: res} = await this.$http.get('categories')
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品分类列表数据失败！')
            }
            this.cateList = res.data
            //console.log(this.cateList)
        },
        handleChange() {
            //console.log(this.addForm.goods_cat)
            if(this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
            }
        },
        beforeTabLeave(activeName, oldActiveName) {
            // console.log(activeName)
            // console.log(oldActiveName)
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选择商品分类！')
                return false
            }
        },
        async tabClicked() {
            // console.log(this.activeIndex)
            // 如果activeIndex等于1  则证明访问的是商品参数面板
            if(this.activeIndex === '1') {
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {sel: 'many'}
                })
                //console.log(res)
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品动态参数失败！')
                }
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                })
                this.manyTableData = res.data
                //console.log(res.data)
            }else if(this.activeIndex === '2') {
                // 如果activeIndex等于2  则证明访问的是商品属性面板
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {sel: 'only'}
                })
                //console.log(res)
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品静态属性失败！')
                }
                // console.log(res.data)
                this.onlyTableData = res.data
            }
        },
        // 处理图片预览的操作
        handlePreview(file) {
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        // 处理图片的移除操作
        handleRemove(file) {
            // 获取将要删除的图片的临时路径 从pics数组中找出图片对应的索引值 
            const filePath = file.response.data.tem_path
            const i = this.addForm.pics.findIndex(x => x.pic === filePath)
            // 调用数组的splice方法 把图片信息对象从pics数组中移除
            this.addForm.pics.splice(i, 1)

        },
        // 监听图片上传成功的事件
        handleSuccess(response) {
            console.log(response)
            // 拼接得到一个图片信息对象
            const picInfo = {pic: response.data.tmp_path}
            // 将图片信息对象push到pics数组中
            this.addForm.pics.push(picInfo)
        },
        add() {
            console.log(this.addForm)
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) {
                    return this.$message.error('请填写必要的表单项！')
                }
                // 如果预校验通过  那么执行添加的业务逻辑
                // lodash cloneDeep(obj) 将addForm深拷贝一份给form 避免影响 
                const form = _.cloneDeep(this.addForm)
                form.goods_cat = form.goods_cat.join(',')
                // 处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {attr_id: item.attr_id, attr_vals: item.attr_vals.join(' ')}
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {attr_id: item.attr_id, attr_vals: item.attr_vals}
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs = this.addForm.attrs
                console.log(form)

                // 发起请求添加商品
                // 商品的名称必须是唯一的
                const {data: res} = await this.$http.post('goods', form)
                if(res.meta.status !== 201) {
                    return this.$message.error('添加商品失败！')
                }
                this.$message.success('添加商品成功！')
                this.$router.push('/goods')
            })
        }
      
    },
    computed: {
        cateId() {
            if(this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]  
            }
            return null
        }
    }
}
</script>

<style scope>
.el-checkbox {
    margin: 0 10px 0 0 !important;
}

.previewImg {
    width: 100%;
}

.btnAdd {
    margin-top: 15px !important;
}
</style>