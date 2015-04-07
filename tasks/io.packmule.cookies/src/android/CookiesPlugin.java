package io.packmule.cookies;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;

import android.webkit.CookieManager;

import android.content.Context;
import android.graphics.Rect;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.ViewTreeObserver.OnGlobalLayoutListener;
import android.view.inputmethod.InputMethodManager;

public class CookiesPlugin extends CordovaPlugin
{
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        if ("get".equals(action)) {
            callbackContext.success(CookieManager.getInstance().getCookie(args.getString(0)));
            return true;
        }
        if ("clear".equals(action)) {
            CookieManager.getInstance().removeAllCookie();
            callbackContext.success();
            return true;
        }
        return false;
    }
}

