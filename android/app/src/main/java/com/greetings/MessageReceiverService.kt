import android.app.Service
import android.content.Intent
import android.os.Bundle
import android.os.IBinder
import com.facebook.react.HeadlessJsTaskService

class MessageReceiverService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val messageIntent = Intent(this, MessageService::class.java)

        // Check if intent has extras and pass them to the new intent
        intent?.extras?.let {
            messageIntent.putExtras(it) // Pass the existing extras from the intent
        }

        startService(messageIntent)
        HeadlessJsTaskService.acquireWakeLockNow(this) // Keep the CPU awake while processing the task

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
