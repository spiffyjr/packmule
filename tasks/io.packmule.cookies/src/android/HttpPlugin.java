package io.packmule.cookies;

import java.util.Iterator;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.github.kevinsawicki.http.HttpRequest;
import com.github.kevinsawicki.http.HttpRequest.HttpRequestException;

public class HttpPlugin extends CordovaPlugin
{
    private CallbackContext callbackContext;

    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException
    {
        this.callbackContext = callbackContext;

        String url = args.getString(0);
        JSONObject headers = args.getJSONObject(1);

        if ("get".equals(action)) {
            HttpGet get = new HttpGet(url, headers, callbackContext);
            cordova.getThreadPool().execute(get);

            return true;
        }

        if ("post".equals(action)) {
            HttpPost get = new HttpPost(url, headers, args.getString(2), callbackContext);
            cordova.getThreadPool().execute(get);

            return true;
        }

        return false;
    }
}

