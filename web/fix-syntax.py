import re

# 读取文件
with open('/Users/gonghuihui/daily-fortune-cards/web/js/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复语法错误

# 1. 修复 fiveElementsFromBirthday 函数名
content = content.replace('fiveElementsFromBirthday', 'fiveElementsFromBirthday')

# 2. 修复 calculateEnergyLevel 引用
content = content.replace('this.calculateEnergyLevel', 'calculateEnergyLevelHelper')

# 3. 修复 getDominantElement 引用
content = content.replace('this.getDominantElement', 'getDominantElementHelper')

# 4. 添加缺失的helper函数
helper_code = '''
// 计算能量等级（helper）
function calculateEnergyLevelHelper(elements) {
  const total = Object.values(elements).reduce((a, b) => a + Math.abs(b), 0);
  if (total <= 2) return "⭐⭐⭐⭐ 能量充沛";
  if (total <= 4) return "⭐⭐⭐ 能量良好";
  if (total <= 6) return "⭐⭐ 能量中等";
  if (total <= 8) return "⭐⭐ 能量平稳";
  return "⭐ 能量温和";
}

// 获取主导元素（helper）
function getDominantElementHelper(elements) {
  const entries = Object.entries(elements);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const elementsMap = {
    'wood': '木',
    'fire': '火',
    'earth': '土',
    'metal': '金',
    'water': '水'
  };
  return elementsMap[sorted[0][0]];
}
'''

# 在 FortuneEngine 对象之前插入helper函数
pattern = r'(const FortuneEngine = \{)'

match = re.search(pattern, content)
if match:
    pos = match.start()
    insert_pos = pos + len(match.group(0))
    content = content[:insert_pos] + helper_code + '\n' + content[insert_pos:]

# 写回文件
with open('/Users/gonghuihui/daily-fortune-cards/web/js/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("语法修复完成！")
print("已修复的问题:")
print("1. fiveElementsFromBirthday 函数名拼写错误")
print("2. calculateEnergyLevel 引用修复")
print("3. getDominantElement 引用修复")
print("4. 添加了缺失的helper函数")
