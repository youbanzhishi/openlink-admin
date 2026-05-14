// OpenLink Admin - JavaScript Logic

function app() {
    return {
        // 视图状态
        currentView: 'dashboard',
        sidebarOpen: false,
        showUserMenu: false,
        
        // 数据
        stats: {
            totalLinks: 0,
            todayClicks: 0,
            totalFiles: 0,
            totalExtensions: 0,
            totalPV: 0,
            totalUV: 0,
            avgResponseTime: 0,
            successRate: 0
        },
        recentLinks: [],
        links: [],
        routes: [],
        files: [],
        extensions: [],
        
        // 筛选
        linkFilters: {
            code: '',
            target: '',
            is_active: '',
            limit: 20,
            offset: 0
        },
        
        // 弹窗
        showCreateLink: false,
        showCreateRoute: false,
        newLink: {
            target: '',
            code: '',
            metadata: '',
            owner: '',
            is_active: true
        },
        
        // 上传
        uploading: false,
        uploadProgress: 0,
        
        // 设置
        settings: {
            apiBase: localStorage.getItem('openlink_api_base') || 'http://localhost:3000',
            apiKey: localStorage.getItem('openlink_api_key') || ''
        },
        
        healthStatus: 'checking',
        
        // 初始化
        async init() {
            await this.checkHealth();
            await this.loadDashboard();
            
            // 响应式侧边栏
            window.addEventListener('resize', () => {
                if (window.innerWidth > 1024) {
                    this.sidebarOpen = false;
                }
            });
        },
        
        // 视图切换
        switchView(view) {
            this.currentView = view;
            this.sidebarOpen = false;
            
            // 加载对应数据
            if (view === 'dashboard') this.loadDashboard();
            else if (view === 'links') this.loadLinks();
            else if (view === 'routes') this.loadRoutes();
            else if (view === 'files') this.loadFiles();
            else if (view === 'extensions') this.loadExtensions();
            else if (view === 'stats') this.loadStats();
            else if (view === 'settings') this.checkHealth();
        },
        
        // API请求
        async apiRequest(endpoint, options = {}) {
            const base = this.settings.apiBase.replace(/\/$/, '');
            const url = `${base}${endpoint}`;
            
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            if (this.settings.apiKey) {
                headers['Authorization'] = `Bearer ${this.settings.apiKey}`;
            }
            
            try {
                const response = await fetch(url, {
                    ...options,
                    headers
                });
                
                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error?.message || `HTTP ${response.status}`);
                }
                
                if (response.status === 204) return null;
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                alert(`请求失败: ${error.message}`);
                throw error;
            }
        },
        
        // 健康检查
        async checkHealth() {
            try {
                const base = this.settings.apiBase.replace(/\/$/, '');
                const response = await fetch(`${base}/health`, { 
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });
                this.healthStatus = response.ok ? '在线' : '离线';
            } catch (error) {
                this.healthStatus = '离线';
            }
        },
        
        // 加载仪表盘
        async loadDashboard() {
            try {
                // 加载链接列表
                const links = await this.apiRequest('/api/v1/links?limit=5');
                this.recentLinks = links || [];
                this.stats.totalLinks = links?.length || 0;
                
                // 扩展
                const exts = await this.apiRequest('/api/v1/extensions').catch(() => []);
                this.extensions = exts || [];
                this.stats.totalExtensions = exts?.length || 0;
                
                // 模拟统计（实际需要后端提供）
                this.stats.todayClicks = Math.floor(Math.random() * 500) + 100;
                this.stats.totalFiles = 0;
            } catch (error) {
                console.error('Load dashboard error:', error);
            }
        },
        
        // 加载链接列表
        async loadLinks() {
            try {
                const params = new URLSearchParams();
                if (this.linkFilters.code) params.append('code', this.linkFilters.code);
                if (this.linkFilters.is_active) params.append('is_active', this.linkFilters.is_active);
                params.append('limit', this.linkFilters.limit);
                params.append('offset', this.linkFilters.offset);
                
                const links = await this.apiRequest(`/api/v1/links?${params}`);
                this.links = links || [];
                this.stats.totalLinks = this.links.length;
            } catch (error) {
                console.error('Load links error:', error);
            }
        },
        
        // 创建链接
        async createLink() {
            if (!this.newLink.target) {
                alert('请输入目标URL');
                return;
            }
            
            try {
                const data = {
                    target: this.newLink.target,
                    code: this.newLink.code || undefined,
                    is_active: this.newLink.is_active
                };
                
                if (this.newLink.metadata) {
                    try {
                        data.metadata = JSON.parse(this.newLink.metadata);
                    } catch (e) {
                        alert('元数据必须是有效的JSON');
                        return;
                    }
                }
                
                if (this.newLink.owner) data.owner = this.newLink.owner;
                
                await this.apiRequest('/api/v1/links', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                
                this.showCreateLink = false;
                this.newLink = { target: '', code: '', metadata: '', owner: '', is_active: true };
                await this.loadLinks();
                alert('创建成功');
            } catch (error) {
                // 错误已在apiRequest中处理
            }
        },
        
        // 编辑链接
        editLink(link) {
            this.newLink = { 
                target: link.target, 
                code: link.code, 
                metadata: JSON.stringify(link.metadata || {}),
                owner: link.owner || '',
                is_active: link.is_active 
            };
            this.showCreateLink = true;
        },
        
        // 删除链接
        async deleteLink(code) {
            if (!confirm(`确定删除链接 ${code} 吗？`)) return;
            
            try {
                await this.apiRequest(`/api/v1/links/${code}`, {
                    method: 'DELETE'
                });
                await this.loadLinks();
                alert('删除成功');
            } catch (error) {
                // 错误已处理
            }
        },
        
        // 加载路由
        async loadRoutes() {
            // TODO: 实现路由加载
            this.routes = [];
        },
        
        // 加载文件
        async loadFiles() {
            // TODO: 实现文件列表
            this.files = [];
        },
        
        // 加载扩展
        async loadExtensions() {
            try {
                const exts = await this.apiRequest('/api/v1/extensions');
                this.extensions = exts || [];
                this.stats.totalExtensions = this.extensions.length;
            } catch (error) {
                this.extensions = [];
            }
        },
        
        // 执行扩展动作
        async executeExtAction(name) {
            const action = prompt(`请输入要执行的扩展动作:`);
            if (!action) return;
            
            try {
                const result = await this.apiRequest(`/api/v1/extensions/${name}/actions/${action}`, {
                    method: 'POST'
                });
                alert(`执行成功: ${JSON.stringify(result)}`);
            } catch (error) {
                // 错误已处理
            }
        },
        
        // 加载统计
        async loadStats() {
            // 模拟数据，实际需要后端提供
            this.stats.totalPV = Math.floor(Math.random() * 10000) + 5000;
            this.stats.totalUV = Math.floor(Math.random() * 2000) + 1000;
            this.stats.avgResponseTime = Math.floor(Math.random() * 50) + 20;
            this.stats.successRate = Math.floor(Math.random() * 5) + 95;
        },
        
        // 刷新数据
        async refreshData() {
            await this.loadDashboard();
        },
        
        // 刷新扩展
        async refreshExtensions() {
            await this.loadExtensions();
        },
        
        // 保存设置
        saveSettings() {
            localStorage.setItem('openlink_api_base', this.settings.apiBase);
            localStorage.setItem('openlink_api_key', this.settings.apiKey);
            alert('配置已保存');
            this.checkHealth();
        },
        
        // 文件上传（待实现）
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) this.uploadFile(file);
        },
        
        handleFileDrop(event) {
            const file = event.dataTransfer.files[0];
            if (file) this.uploadFile(file);
        },
        
        async uploadFile(file) {
            this.uploading = true;
            this.uploadProgress = 0;
            
            try {
                // 1. 请求上传预签名URL
                const { upload_url, file_id } = await this.apiRequest('/api/v1/files/upload', {
                    method: 'POST',
                    body: JSON.stringify({
                        filename: file.name,
                        size: file.size,
                        content_type: file.type,
                        generate_share_link: true
                    })
                });
                
                // 2. 上传到存储
                await fetch(upload_url, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type }
                });
                
                this.uploadProgress = 100;
                await this.loadFiles();
                alert('上传成功');
            } catch (error) {
                alert(`上传失败: ${error.message}`);
            } finally {
                this.uploading = false;
            }
        },
        
        // 复制分享链接
        copyShareLink(code) {
            const url = `${this.settings.apiBase}/api/v1/files/share/${code}`;
            navigator.clipboard.writeText(url).then(() => {
                alert('链接已复制');
            });
        },
        
        // 格式化日期
        formatDate(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // 格式化文件大小
        formatSize(bytes) {
            if (!bytes) return '-';
            const units = ['B', 'KB', 'MB', 'GB'];
            let size = bytes;
            let unitIndex = 0;
            while (size >= 1024 && unitIndex < units.length - 1) {
                size /= 1024;
                unitIndex++;
            }
            return `${size.toFixed(1)} ${units[unitIndex]}`;
        }
    };
}
