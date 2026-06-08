/**
 * Safely calls a method on the WhatsApp client with retry logic.
 * This helps handle transient puppeteer errors like 'Execution context was destroyed'
 * or 'Cannot read properties of undefined' during initialization.
 * 
 * @param {object} client - The whatsapp-web.js client instance
 * @param {string} methodName - The method to call (e.g., 'getChats', 'getContacts')
 * @param {Array} args - Arguments to pass to the method
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 2000)
 * @returns {Promise<any>}
 */
export const safeClientCall = async (client, methodName, args = [], retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (!client) throw new Error("Client not provided");
      
      // Ensure method exists
      if (typeof client[methodName] !== 'function') {
        throw new Error(`Method ${methodName} does not exist on client`);
      }

      // Special check: if it's getChats or getContacts, we might want to check if client.pupPage exists
      // but pupPage is internal. We rely on the catch block for now.
      
      return await client[methodName](...args);
    } catch (err) {
      const isTransient = 
        err.message.includes("undefined (reading 'getChats')") || 
        err.message.includes("undefined (reading 'getContacts')") ||
        err.message.includes("reading 'evaluate'") ||
        err.message.includes("Execution context was destroyed") ||
        err.message.includes("navigating");

      if (isTransient && i < retries - 1) {
        console.warn(`⚠️ [Retry ${i + 1}/${retries}] WhatsApp client error during ${methodName}: ${err.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`❌ [Final Error] WhatsApp client ${methodName} failed:`, err.message);
      throw err;
    }
  }
};
