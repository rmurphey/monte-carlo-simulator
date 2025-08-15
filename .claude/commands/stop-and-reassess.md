# Stop And Reassess - Debugging Circuit Breaker

Circuit breaker for expensive debugging loops - enforce the 5-minute rule.

## Usage
Use `npm run context:stop-and-reassess` to trigger debugging circuit breaker, then:

## Emergency Stop: When Debugging >5 Minutes

### STOP These Expensive Patterns:
- ❌ Adding debug code that doesn't execute
- ❌ Trying multiple variations of same approach  
- ❌ Clearing caches repeatedly
- ❌ Making assumptions without evidence
- ❌ Restarting processes "just in case"

### START Efficient Debugging:
1. **Find working equivalent functionality**
2. **Compare working vs broken approaches**
3. **Test fix inline in test file first**
4. **Use minimal change with proven pattern**
5. **Verify with single test run**

## Emergency Checklist
1. ⏹️ **STOP** current approach
2. 🔍 **FIND** working equivalent  
3. 📋 **COMPARE** working vs broken
4. 🧪 **TEST** fix inline first
5. ✅ **IMPLEMENT** minimal change

## Efficiency Targets
- **Time to fix**: <5 minutes
- **Token cost**: <1,000 tokens  
- **Approach changes**: <2
- **Debug iterations**: <3

Break expensive debugging loops immediately.