/**
 * 从字符串中删除指定的子字符串
 * @param {string} originalStr - 原始字符串
 * @param {string} substringToRemove - 要删除的子字符串
 * @param {boolean} [caseSensitive=true] - 是否区分大小写，默认为true
 * @param {boolean} [global=true] - 是否全局删除所有匹配项，默认为true
 * @returns {string} 删除指定子字符串后的新字符串
 */
export function removeSubstring(originalStr, substringToRemove, caseSensitive = true, global = true) {
    // 处理空字符串或无效输入
    if (typeof originalStr !== 'string' || typeof substringToRemove !== 'string') {
        return originalStr;
    }
    
    if (substringToRemove === '') {
        return originalStr;
    }
    
    // 根据是否区分大小写创建正则表达式
    let flags = caseSensitive ? 'g' : 'gi';
    if (!global) {
        // 如果不是全局删除，移除g标志
        flags = flags.replace('g', '');
    }
    
    try {
        // 创建正则表达式并替换
        const regex = new RegExp(substringToRemove, flags);
        return originalStr.replace(regex, '');
    } catch (e) {
        // 处理特殊字符导致的正则表达式错误
        // 回退到字符串分割方法
        if (global) {
            if (caseSensitive) {
                return originalStr.split(substringToRemove).join('');
            } else {
                // 不区分大小写的全局删除
                let result = originalStr;
                let index = result.toLowerCase().indexOf(substringToRemove.toLowerCase());
                
                while (index !== -1) {
                    const before = result.substring(0, index);
                    const after = result.substring(index + substringToRemove.length);
                    result = before + after;
                    index = result.toLowerCase().indexOf(substringToRemove.toLowerCase());
                }
                
                return result;
            }
        } else {
            // 只删除第一个匹配项
            if (caseSensitive) {
                const index = originalStr.indexOf(substringToRemove);
                if (index === -1) return originalStr;
                
                return originalStr.substring(0, index) + 
                       originalStr.substring(index + substringToRemove.length);
            } else {
                // 不区分大小写的单次删除
                const lowerOriginal = originalStr.toLowerCase();
                const lowerSubstring = substringToRemove.toLowerCase();
                const index = lowerOriginal.indexOf(lowerSubstring);
                
                if (index === -1) return originalStr;
                
                return originalStr.substring(0, index) + 
                       originalStr.substring(index + substringToRemove.length);
            }
        }
    }
}