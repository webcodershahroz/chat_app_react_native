import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

class MessageService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        // Extracting extras from intent and converting them to WritableMap
        val extras = intent?.extras
        val data: WritableMap = Arguments.createMap()

        extras?.keySet()?.forEach { key ->
            when (val value = extras.get(key)) {
                is String -> data.putString(key, value)
                is Int -> data.putInt(key, value)
                is Boolean -> data.putBoolean(key, value)
                // Add other types as needed
            }
        }

        return if (extras != null) {
            HeadlessJsTaskConfig(
                "MessageService", // The name of the task you registered in JavaScript
                data, // Pass the WritableMap to the task
                5000, // Timeout for the task
                true // Whether the task is allowed to run in the foreground
            )
        } else {
            null
        }
    }
}
