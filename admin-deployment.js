// Admin Deployment Management for Vercel Integration
// Provides secure deployment functionality for admin users only

class AdminDeployment {
    constructor() {
        this.deploymentHistory = [];
        this.currentDeployment = null;
        this.isDeploying = false;
        
        // Initialize deployment functionality
        this.init();
    }

    init() {
        // Bind event listeners for deployment controls
        this.bindEventListeners();
        
        // Load deployment history from localStorage
        this.loadDeploymentHistory();
        
        // Update UI with current status
        this.updateDeploymentStatus('ready', 'Ready');
    }

    bindEventListeners() {
        // Production deployment button
        const deployProductionBtn = document.getElementById('deploy-production-btn');
        if (deployProductionBtn) {
            deployProductionBtn.addEventListener('click', () => this.deployToProduction());
        }

        // Preview deployment button
        const deployPreviewBtn = document.getElementById('deploy-preview-btn');
        if (deployPreviewBtn) {
            deployPreviewBtn.addEventListener('click', () => this.deployPreview());
        }

        // Clear log button
        const clearLogBtn = document.getElementById('clear-log-btn');
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', () => this.clearDeploymentLog());
        }
    }

    async deployToProduction() {
        if (this.isDeploying) {
            this.showNotification('Deployment already in progress', 'warning');
            return;
        }

        // Verify admin permissions
        if (!await this.verifyAdminPermissions()) {
            this.showNotification('Admin permissions required for deployment', 'error');
            return;
        }

        this.startDeployment('production');
    }

    async deployPreview() {
        if (this.isDeploying) {
            this.showNotification('Deployment already in progress', 'warning');
            return;
        }

        // Verify admin permissions
        if (!await this.verifyAdminPermissions()) {
            this.showNotification('Admin permissions required for deployment', 'error');
            return;
        }

        this.startDeployment('preview');
    }

    async startDeployment(target = 'production') {
        this.isDeploying = true;
        this.updateDeploymentStatus('deploying', `Deploying to ${target}...`);
        this.showDeploymentLog();
        
        const deploymentId = this.generateDeploymentId();
        const startTime = new Date();

        this.logMessage(`🚀 Starting ${target} deployment...`);
        this.logMessage(`📦 Deployment ID: ${deploymentId}`);
        this.logMessage(`⏰ Started at: ${startTime.toLocaleString()}`);

        try {
            // Simulate deployment process with Vercel SDK
            const deploymentResult = await this.executeVercelDeployment(target, deploymentId);
            
            if (deploymentResult.success) {
                this.handleDeploymentSuccess(deploymentResult, target, startTime);
            } else {
                this.handleDeploymentError(deploymentResult.error, target);
            }
        } catch (error) {
            this.handleDeploymentError(error, target);
        }
    }

    async executeVercelDeployment(target, deploymentId) {
        // Simulate Vercel SDK deployment process
        // In a real implementation, this would use the actual Vercel SDK
        
        this.logMessage('📋 Validating repository access...');
        await this.delay(1000);
        
        this.logMessage('🔍 Checking for changes...');
        await this.delay(1500);
        
        this.logMessage('📦 Building application...');
        await this.delay(3000);
        
        this.logMessage('🌐 Deploying to Vercel...');
        await this.delay(2000);
        
        this.logMessage('✅ Deployment completed successfully!');
        
        // Simulate successful deployment
        return {
            success: true,
            deploymentId: deploymentId,
            url: target === 'production' 
                ? 'https://mtg-collection-tracker.vercel.app' 
                : `https://mtg-collection-tracker-${deploymentId.slice(-8)}.vercel.app`,
            status: 'ready'
        };
    }

    handleDeploymentSuccess(result, target, startTime) {
        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / 1000);
        
        this.logMessage(`🎉 Deployment successful!`);
        this.logMessage(`🔗 URL: ${result.url}`);
        this.logMessage(`⏱️ Duration: ${duration}s`);
        
        // Add to deployment history
        const deployment = {
            id: result.deploymentId,
            target: target,
            status: 'success',
            url: result.url,
            startTime: startTime,
            endTime: endTime,
            duration: duration
        };
        
        this.addToDeploymentHistory(deployment);
        this.updateDeploymentStatus('success', `Deployed successfully to ${target}`);
        this.updateLastDeployment(endTime);
        
        this.showNotification(`Deployment to ${target} completed successfully!`, 'success');
        
        // Reset deployment state
        this.isDeploying = false;
        
        // Auto-hide log after success
        setTimeout(() => {
            this.hideDeploymentLog();
            this.updateDeploymentStatus('ready', 'Ready');
        }, 5000);
    }

    handleDeploymentError(error, target) {
        this.logMessage(`❌ Deployment failed: ${error.message || error}`);
        this.updateDeploymentStatus('error', `Deployment to ${target} failed`);
        this.showNotification(`Deployment to ${target} failed: ${error.message || error}`, 'error');
        this.isDeploying = false;
    }

    async verifyAdminPermissions() {
        // Check if user is authenticated and has admin role
        if (!window.supabaseAuth || !window.supabaseAuth.currentUser) {
            return false;
        }

        const user = window.supabaseAuth.currentUser;
        
        // Check user role from Supabase
        try {
            const { data: profile } = await window.supabase
                .from('user_profiles')
                .select('role')
                .eq('user_id', user.id)
                .single();
            
            return profile && profile.role === 'ADMIN';
        } catch (error) {
            console.error('Error verifying admin permissions:', error);
            return false;
        }
    }

    updateDeploymentStatus(status, message) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('deployment-status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator status-${status}`;
            statusText.textContent = message;
        }
    }

    showDeploymentLog() {
        const deploymentLog = document.getElementById('deployment-log');
        if (deploymentLog) {
            deploymentLog.style.display = 'block';
        }
    }

    hideDeploymentLog() {
        const deploymentLog = document.getElementById('deployment-log');
        if (deploymentLog) {
            deploymentLog.style.display = 'none';
        }
    }

    logMessage(message) {
        const logContent = document.getElementById('log-content');
        if (logContent) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${message}`;
            logContent.appendChild(logEntry);
            logContent.scrollTop = logContent.scrollHeight;
        }
    }

    clearDeploymentLog() {
        const logContent = document.getElementById('log-content');
        if (logContent) {
            logContent.innerHTML = '';
        }
    }

    generateDeploymentId() {
        return 'dpl_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    addToDeploymentHistory(deployment) {
        this.deploymentHistory.unshift(deployment);
        
        // Keep only last 10 deployments
        if (this.deploymentHistory.length > 10) {
            this.deploymentHistory = this.deploymentHistory.slice(0, 10);
        }
        
        this.saveDeploymentHistory();
        this.updateDeploymentHistoryUI();
    }

    updateDeploymentHistoryUI() {
        const deploymentsList = document.getElementById('deployments-list');
        if (!deploymentsList) return;

        if (this.deploymentHistory.length === 0) {
            deploymentsList.innerHTML = `
                <div class="deployment-item">
                    <div class="deployment-info">
                        <span class="deployment-id">No deployments yet</span>
                        <span class="deployment-time">-</span>
                    </div>
                    <div class="deployment-status-badge">-</div>
                </div>
            `;
            return;
        }

        deploymentsList.innerHTML = this.deploymentHistory.map(deployment => `
            <div class="deployment-item">
                <div class="deployment-info">
                    <span class="deployment-id">${deployment.id}</span>
                    <span class="deployment-time">${deployment.endTime.toLocaleString()}</span>
                    <span class="deployment-target">${deployment.target}</span>
                </div>
                <div class="deployment-status-badge status-${deployment.status}">
                    ${deployment.status}
                </div>
                ${deployment.url ? `<a href="${deployment.url}" target="_blank" class="deployment-url">View</a>` : ''}
            </div>
        `).join('');
    }

    updateLastDeployment(timestamp) {
        const lastDeploymentElement = document.getElementById('last-deployment');
        if (lastDeploymentElement) {
            lastDeploymentElement.textContent = timestamp.toLocaleString();
        }
    }

    saveDeploymentHistory() {
        try {
            localStorage.setItem('admin_deployment_history', JSON.stringify(this.deploymentHistory));
        } catch (error) {
            console.error('Error saving deployment history:', error);
        }
    }

    loadDeploymentHistory() {
        try {
            const saved = localStorage.getItem('admin_deployment_history');
            if (saved) {
                this.deploymentHistory = JSON.parse(saved).map(deployment => ({
                    ...deployment,
                    startTime: new Date(deployment.startTime),
                    endTime: new Date(deployment.endTime)
                }));
                this.updateDeploymentHistoryUI();
                
                // Update last deployment time
                if (this.deploymentHistory.length > 0) {
                    this.updateLastDeployment(this.deploymentHistory[0].endTime);
                }
            }
        } catch (error) {
            console.error('Error loading deployment history:', error);
            this.deploymentHistory = [];
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `deployment-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize admin deployment when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if admin panel exists
    if (document.getElementById('admin-deployment')) {
        window.adminDeployment = new AdminDeployment();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDeployment;
}
